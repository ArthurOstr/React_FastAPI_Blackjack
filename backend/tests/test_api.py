import pytest
from app import app, db, User


@pytest.fixture
def client():
    # Reconfiguration for testing
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///memory:"
    # Disable login protection
    app.config["WTF_CSRF_ENABLED"] = False

    # Spin up the simulated Werkzeug test client
    with app.test_client() as client:
        # The database context
        with app.app_context():
            db.create_all()
            # Yield hands control over the test function
            yield client

            # Destroy the database after the test finish
            db.session.remove()
            db.drop_all()


def test_successful_registration_return_201(client):
    # ARRANGE
    payload = {"username": "test_engineer", "password": "secure_password123"}

    # ACT
    response = client.post("/api/register", json=payload)

    # ASSERT BLOCK
    # Verification the network protocol
    assert response.status_code == 201

    # Verification the JSON payload structure
    data = response.get_json()
    assert data["username"] == "test_engineer"
    assert data["money"] == 1000

    # Verification Database Persistence
    user_in_db = User.query.filter_by(username="test_engineer").first()
    assert user_in_db is not None
    assert user_in_db.password_hash != "secure_password123"


def test_duplicate_registration_returns_409(client):

    payload_one = {"username": "clone_trooper", "password": "123"}
    client.post("/api/register", json=payload_one)

    payload_two = {"username": "clone_trooper", "password": "321"}
    response = client.post("/api/register", json=payload_two)

    assert response.status_code == 409

    data = response.get_json()
    assert "error" in data
    assert data["error"] == "Nickname taken! Try another one."
