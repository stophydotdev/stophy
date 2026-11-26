use serde_json::Value;

#[test]
fn recorded_agent_answers_keep_the_payload() -> anyhow::Result<()> {
    for (kind, field) in [("search", "web"), ("scrape", "markdown")] {
        let path = format!("../../docs/scripts/responses/{kind}.json");
        let mut recording: Value = serde_json::from_reader(std::fs::File::open(path)?)?;
        let reply = recording["response"].take();
        let answer = stophy::agent_answer(kind, reply.clone());
        assert!(!reply["data"][field].is_null());
        assert_eq!(answer[field], reply["data"][field]);
    }
    Ok(())
}
