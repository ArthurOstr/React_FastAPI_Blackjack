import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from main import app
from database import get_db, Base
from BJ_classes import Hand, Card

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)


async def override_get_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        await db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_read_main():
    response = client.get("/api/")
    assert response.status_code == 200

def test_successful_registration():
    payload = {"username": "test", "password": "secure_password"}

    response = client.post("/api/register", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["username"] == "test"
    assert data["balance"] == "1000.00"

def test_duplicate_registration_returns_400():
    payload = {"username": "test", "password": "secure_password"}
    client.post("/api/register", json=payload)
    response = client.post("/api/register", json=payload)

    assert response.status_code == 400

    data = response.json()
    assert "detail" in data
    assert data["detail"] == "Username already taken. Try another"

def test_successful_login_returns_token():
    payload = {"username": "test", "password": "secure_password"}
    client.post("/api/register", json=payload)

    response = client.post("/api/login", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data

    assert len(data["access_token"]) > 20


def test_blackjack_ace_logic():
    test_hand = Hand()

    test_hand.cards = [
        Card(suit="Spades", rank="Ace"),
        Card(suit="Hearts", rank="King")
    ]

    assert test_hand.get_value() == 21

    test_hand_two = Hand()
    test_hand_two.cards = [
        Card(suit="Spades", rank="Ace"),
        Card(suit="Hearts", rank="9"),
        Card(suit="Clubs", rank="5")
    ]
    assert test_hand_two.get_value() == 15