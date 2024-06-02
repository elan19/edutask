import pymongo.errors
import pytest
from unittest.mock import patch
from src.util.dao import DAO
import pymongo
import json

# Load the test.json file
with open(f'./src/static/validators/test.json', 'r') as f:
    struct = json.load(f)

# struct = {"$jsonSchema": {"bsonType": "object","required": ["test"],"properties": {"test": {"bsonType": "string","description": "the first name of a user must be determined","uniqueItems": True},"test2": {"bsonType": "string","description": "the last name of a user must be determined"},}}}

@pytest.fixture
def sut():
    with patch('src.util.dao.getValidator', return_value=struct):
        dao = DAO("test")
        yield dao
        dao.drop()

@pytest.mark.integration
def test_create(sut):
    data = {"name": "test create"}
    user = sut.create(data)
    print(user)
    assert user["name"] == data["name"]

@pytest.mark.integration
def test_write_error(sut):
    data = {"lastName": "test3"}
    with pytest.raises(pymongo.errors.WriteError):
        sut.create(data)

@pytest.mark.integration
def test_incorrect_formated_data(sut):
    data = {"name": 123}
    with pytest.raises(pymongo.errors.WriteError):
        sut.create(data)

@pytest.mark.integration
def test_fail_unique_items(sut):
    # Name is unique property should raise an error
    data1 = {"name": "unique", "test": "random"}
    data2 = {"name": "unique", "test": "hejsan"}
    sut.create(data1)
    with pytest.raises(pymongo.errors.WriteError):
        sut.create(data2)
        