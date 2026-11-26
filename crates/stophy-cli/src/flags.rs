use std::collections::BTreeSet;

use anyhow::{Context, Result, anyhow, bail};
use serde_json::{Map, Value, json};

#[derive(Clone, Copy, PartialEq, Eq)]
enum Kind {
    Text,
    Integer,
    Number,
    Boolean,
    List,
    Json,
}

pub struct Flag<'a> {
    name: String,
    schema: &'a Value,
    required: bool,
    group: Option<String>,
}

fn variants(schema: &Value) -> impl Iterator<Item = &Value> {
    schema["anyOf"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|branch| branch["type"] != "null")
}

fn kind(schema: &Value) -> Kind {
    if let Some(name) = schema["type"].as_str() {
        return match name {
            "string" => Kind::Text,
            "integer" => Kind::Integer,
            "number" => Kind::Number,
            "boolean" => Kind::Boolean,
            "array"
                if matches!(
                    kind(&schema["items"]),
                    Kind::Text | Kind::Integer | Kind::Number | Kind::Boolean
                ) =>
            {
                Kind::List
            }
            _ => Kind::Json,
        };
    }
    if schema["enum"]
        .as_array()
        .is_some_and(|values| values.iter().all(Value::is_string))
    {
        return Kind::Text;
    }
    let branches: Vec<_> = variants(schema).collect();
    match branches.as_slice() {
        [only] => kind(only),
        [first, ..] if branches.iter().all(|branch| kind(branch) == Kind::Text) => kind(first),
        [_, ..]
            if branches.iter().all(|branch| {
                matches!(kind(branch), Kind::Integer | Kind::Number) && branch["const"].is_number()
            }) =>
        {
            if branches.iter().all(|branch| kind(branch) == Kind::Integer) {
                Kind::Integer
            } else {
                Kind::Number
            }
        }
        _ => Kind::Json,
    }
}

fn is_required(schema: &Value, name: &str) -> bool {
    schema["required"]
        .as_array()
        .is_some_and(|required| required.iter().any(|item| item == name))
}

pub fn slots(schema: &Value) -> Vec<Flag<'_>> {
    let mut result = Vec::new();
    flatten(schema, "", None, &mut result);
    result
}

fn flatten<'a>(schema: &'a Value, prefix: &str, group: Option<&str>, result: &mut Vec<Flag<'a>>) {
    let Some(properties) = schema["properties"].as_object() else {
        return;
    };
    for (name, field) in properties {
        let path = if prefix.is_empty() {
            name.clone()
        } else {
            format!("{prefix}.{name}")
        };
        let required = is_required(schema, name);
        let shape = effective(field);
        if shape["type"] == "object" && shape["properties"].is_object() {
            flatten(
                shape,
                &path,
                if required { group } else { Some(&path) },
                result,
            );
        } else {
            result.push(Flag {
                name: path,
                schema: field,
                required,
                group: group.map(str::to_owned),
            });
        }
    }
}

fn effective(schema: &Value) -> &Value {
    let mut branches = variants(schema);
    match (branches.next(), branches.next()) {
        (Some(only), None) => only,
        _ => schema,
    }
}

fn positional<'a>(flags: &'a [Flag<'_>]) -> Option<&'a str> {
    let mut required = flags
        .iter()
        .filter(|flag| flag.required && flag.group.is_none());
    let first = required.next()?;
    if first.name.contains('.') || kind(first.schema) != Kind::Text || required.next().is_some() {
        return None;
    }
    Some(&first.name)
}

fn option_token(token: &str) -> bool {
    token.starts_with('-') && token.parse::<f64>().is_err()
}

pub fn parse(tokens: &[String], schema: &Value) -> Result<Map<String, Value>> {
    let flags = slots(schema);
    let mut seen = BTreeSet::<&str>::new();
    let choices = schema["sendOne"]
        .as_array()
        .map(|items| items.iter().filter_map(Value::as_str).collect::<Vec<_>>())
        .unwrap_or_default();
    let pair = match choices.as_slice() {
        [link, id] if link.ends_with("Url") => Some((*link, *id)),
        _ => None,
    };
    let position = positional(&flags).or_else(|| schema["positional"].as_str());
    let mut input = tokens.iter().map(String::as_str).peekable();
    let mut body = Map::new();
    while let Some(token) = input.next() {
        if token == "--" {
            if let Some(extra) = input.next() {
                bail!("Unexpected argument `{extra}`.");
            }
            break;
        }
        let (name, inline) = token
            .split_once('=')
            .map_or((token, None), |(name, raw)| (name, Some(raw)));
        let (name, direct, negated) = if let Some(name) = name.strip_prefix("--") {
            let (name, negated) = name
                .strip_prefix("no-")
                .map_or((name, false), |name| (name, true));
            (name, inline, negated)
        } else if !token.starts_with('-') {
            let named_pair = pair
                .filter(|(link, id)| !seen.contains(link) && !seen.contains(id))
                .map(|(link, id)| {
                    if token.to_ascii_lowercase().starts_with("https://")
                        || token.to_ascii_lowercase().starts_with("http://")
                    {
                        link
                    } else {
                        id
                    }
                });
            (
                position
                    .or(named_pair)
                    .filter(|name| !seen.contains(name))
                    .with_context(|| format!("Unexpected argument `{token}`."))?,
                Some(token),
                false,
            )
        } else {
            bail!("Unknown flag {token}. Run this command with --help.");
        };
        if name == "parsers" && flags.iter().any(|flag| flag.name == "parser") {
            bail!(
                "Use --parser <name>, or set formats[].parser with --formats. Run `stophy parsers` to find a name."
            );
        }
        let Some(flag) = flags.iter().find(|flag| flag.name == name) else {
            bail!("Unknown flag {token}. Run this command with --help.");
        };
        let shape = kind(flag.schema);
        if !seen.insert(&flag.name) && shape != Kind::List {
            bail!("Flag --{name} was given twice.");
        }
        let value = if negated {
            if shape != Kind::Boolean || direct.is_some() {
                bail!("Invalid flag {token}.");
            }
            Value::Bool(false)
        } else {
            let raw = direct.or_else(|| input.next_if(|token| !option_token(token)));
            match raw {
                Some(raw) => read_value(name, flag.schema, raw)?,
                None if shape == Kind::Boolean => Value::Bool(true),
                None => bail!("Missing value for --{name}."),
            }
        };
        insert(&mut body, name, value)?;
    }

    for flag in &flags {
        if flag.required
            && !seen.contains(flag.name.as_str())
            && flag.group.as_ref().is_none_or(|group| {
                seen.iter().any(|filled| {
                    filled
                        .strip_prefix(group)
                        .is_some_and(|tail| tail.starts_with('.'))
                })
            })
        {
            bail!("Missing required flag --{}.", flag.name);
        }
        if kind(flag.schema) == Kind::List {
            let value = flag
                .name
                .split('.')
                .fold(None, |value: Option<&Value>, field| {
                    value.map_or_else(|| body.get(field), |value| value.get(field))
                });
            if let Some(items) = value.and_then(Value::as_array) {
                bounds(
                    &flag.name,
                    items.len() as f64,
                    effective(flag.schema),
                    "minItems",
                    "maxItems",
                )?;
            }
        }
    }
    if !choices.is_empty() && choices.iter().filter(|name| seen.contains(**name)).count() != 1 {
        let options = choices
            .iter()
            .map(|name| format!("--{name}"))
            .collect::<Vec<_>>()
            .join(" or ");
        bail!("Send exactly one of {options}.");
    }
    Ok(body)
}

fn insert(body: &mut Map<String, Value>, name: &str, value: Value) -> Result<()> {
    let mut fields = name.split('.').peekable();
    let mut body = body;
    while let Some(field) = fields.next() {
        if fields.peek().is_none() {
            if let (Some(Value::Array(items)), Value::Array(next)) = (body.get_mut(field), &value) {
                items.extend(next.iter().cloned());
            } else {
                body.insert(field.to_owned(), value);
            }
            break;
        }
        body = body
            .entry(field)
            .or_insert_with(|| json!({}))
            .as_object_mut()
            .with_context(|| format!("Conflict between options for --{name}."))?;
    }
    Ok(())
}

fn read_value(name: &str, schema: &Value, raw: &str) -> Result<Value> {
    let shape = kind(schema);
    let schema = effective(schema);
    let value = match shape {
        Kind::Text => {
            let text = raw.trim();
            bounds(
                name,
                text.encode_utf16().count() as f64,
                schema,
                "minLength",
                "maxLength",
            )?;
            let expressions = schema["pattern"]
                .as_str()
                .into_iter()
                .chain(variants(schema).filter_map(|branch| branch["pattern"].as_str()))
                .filter_map(|pattern| regex::Regex::new(pattern).ok())
                .collect::<Vec<_>>();
            if !expressions.is_empty() && !expressions.iter().any(|pattern| pattern.is_match(text))
            {
                bail!("--{name} does not match the expected format.");
            }
            json!(text)
        }
        Kind::Integer => json!(
            raw.parse::<i64>()
                .ok()
                .filter(|n| n.unsigned_abs() <= 9_007_199_254_740_991)
                .with_context(|| format!("--{name} must be an integer."))?
        ),
        Kind::Number => {
            let parsed = raw
                .parse::<f64>()
                .ok()
                .filter(|n| n.is_finite() && !raw.contains(['e', 'E']))
                .with_context(|| format!("--{name} must be a number."))?;
            json!(parsed)
        }
        Kind::Boolean => json!(
            raw.parse::<bool>()
                .with_context(|| format!("--{name} must be true or false."))?
        ),
        Kind::List => {
            let values = raw
                .split(',')
                .map(str::trim)
                .filter(|item| !item.is_empty())
                .map(|item| read_value(name, &schema["items"], item))
                .collect::<Result<Vec<_>>>()?;
            if values.is_empty() {
                bail!("--{name} has an empty item.");
            }
            Value::Array(values)
        }
        Kind::Json => serde_json::from_str(raw).map_err(|_| anyhow!("--{name} must be JSON."))?,
    };
    if let Some(number) = value.as_f64() {
        bounds(name, number, schema, "minimum", "maximum")?;
        if schema["exclusiveMinimum"]
            .as_f64()
            .is_some_and(|min| number <= min)
        {
            bail!(
                "--{name} must be greater than {}.",
                schema["exclusiveMinimum"]
            );
        }
        if schema["exclusiveMaximum"]
            .as_f64()
            .is_some_and(|max| number >= max)
        {
            bail!("--{name} must be less than {}.", schema["exclusiveMaximum"]);
        }
    }
    let allowed = schema["enum"]
        .as_array()
        .into_iter()
        .flatten()
        .chain(schema.get("const"))
        .chain(variants(schema).filter_map(|branch| branch.get("const")))
        .collect::<Vec<_>>();
    if !allowed.is_empty()
        && !allowed.iter().any(|allowed| {
            **allowed == value
                || value
                    .as_f64()
                    .is_some_and(|number| allowed.as_f64() == Some(number))
        })
    {
        let values = allowed
            .iter()
            .map(|item| {
                item.as_str()
                    .map_or_else(|| item.to_string(), str::to_owned)
            })
            .collect::<Vec<_>>()
            .join(", ");
        bail!("--{name} must be one of {values}.");
    }
    Ok(value)
}

fn bounds(name: &str, length: f64, schema: &Value, min: &str, max: &str) -> Result<()> {
    if schema[min].as_f64().is_some_and(|min| length < min) {
        bail!("--{name} must be at least {}.", schema[min]);
    }
    if schema[max].as_f64().is_some_and(|max| length > max) {
        bail!("--{name} must be at most {}.", schema[max]);
    }
    Ok(())
}

pub fn help(schema: &Value) -> String {
    let flags = slots(schema);
    let mut lines = Vec::new();
    if let Some(name) = positional(&flags) {
        lines.push(format!("Position: <{name}>"));
    }
    for flag in flags {
        let label = match kind(flag.schema) {
            Kind::Text => " <text>",
            Kind::Number | Kind::Integer => " <number>",
            Kind::Boolean => "",
            Kind::List => " <list>",
            Kind::Json => " <json>",
        };
        let shape = effective(flag.schema);
        let description = flag.schema["description"]
            .as_str()
            .or_else(|| shape["description"].as_str())
            .unwrap_or_default();
        let required = if !flag.required {
            String::new()
        } else {
            flag.group.map_or_else(
                || " (required)".to_owned(),
                |group| format!(" (required with {group})"),
            )
        };
        let options = shape["enum"]
            .as_array()
            .map(|values| {
                let values = values
                    .iter()
                    .map(|value| {
                        value
                            .as_str()
                            .map_or_else(|| value.to_string(), str::to_owned)
                    })
                    .collect::<Vec<_>>()
                    .join(", ");
                format!(" [{values}]")
            })
            .unwrap_or_default();
        lines.push(format!(
            "  --{}{label}  {description}{required}{options}",
            flag.name
        ));
    }
    lines.join("\n")
}
