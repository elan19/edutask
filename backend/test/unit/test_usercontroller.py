import pytest
import unittest.mock as mock
from src.controllers.usercontroller import UserController  # replace 'your_module' with the actual module name
from src.util.helpers import hasAttribute

# #   email               outcome
# 1   account exists      user object
# 2   no account          None
# 3   invalid email       ValueError
# 4   multiple accounts   user object

@pytest.mark.unit
def test_corr_email():
    mockusercontroller = mock.MagicMock()
    sut = UserController(dao=mockusercontroller)

    user = [{'firstName': 'Bengt', 'lastName': 'Karlsson', 'email': 'email@email.com'}]
    mockusercontroller.find.return_value = user
    res = sut.get_user_by_email("email@email.com")
    assert res["firstName"] == "Bengt"

@pytest.mark.unit
def test_no_matching_user():
    mockusercontroller = mock.MagicMock()
    mockusercontroller.find.return_value = None
    sut = UserController(dao=mockusercontroller)
    assert sut.get_user_by_email("email@email.com") is None

@pytest.mark.unit
def test_invalid_email():
    mockusercontroller = mock.MagicMock()
    sut = UserController(dao=mockusercontroller)
    with pytest.raises(ValueError):
        sut.get_user_by_email("....2456qsazgf")

@pytest.mark.unit
def test_db_failure():
    mockusercontroller = mock.MagicMock()
    sut = UserController(dao=mockusercontroller)
    mockusercontroller.find.side_effect = Exception("Database failure")
    with pytest.raises(Exception):
        sut.get_user_by_email("XXXXXXXXXXXXXXX")

@pytest.mark.unit
def test_multiple_users():
    mockusercontroller = mock.MagicMock()
    sut = UserController(dao=mockusercontroller)
    user = [
        {'firstName': 'Bengt', 'lastName': 'Karlsson', 'email': 'email@email.com'},
        {'firstName': 'Berit', 'lastName': 'Karlsson', 'email': 'email@email.com'}
            ]
    mockusercontroller.find.return_value = user
    res = sut.get_user_by_email("email@email.com")

    assert user[0] == res