import pytest
from pymongo import MongoClient
import unittest.mock as mock
from src.util.dao import DAO

@pytest.fixture
def sut():
    dao = DAO("user")
    yield dao
    dao.drop()

@pytest.mark.integration
def test_create(sut):
    data = {"email": "test@test.com", "firstName": "test2", "lastName": "test3"}
    user = sut.create(data)
    assert user["email"] == data["email"]

@pytest.mark.integration
def test_write_error(sut):
    data = {"firstName": "test2", "lastName": "test3"}
    with pytest.raises(Exception):
        sut.create(data)
