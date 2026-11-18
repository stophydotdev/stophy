import pytest

from fake_api import FakeApi


@pytest.fixture
def serve():
    started = []

    def start(answer):
        api = FakeApi(answer)
        started.append(api)
        return api

    yield start
    for api in started:
        api.close()
