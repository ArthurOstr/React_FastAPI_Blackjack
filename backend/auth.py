import os
from typing_extensions import deprecated
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt

# Congiguration
SECRET_KEY = os.getenv("SECRET_KEY", "super-duper-and-very-secret-key")
ALGORITHM = "HS256"
ACESS_TOKEN_EXPIRE_MINUTES = 60

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if the password matches database hashed_password"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Convertation str password into hashed_password"""
    return pwd_context.hash(password)


# JSON Web Token generation
def create_access_token(data: dict):
    """Generates the JWT pass for the user"""
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(minutes=ACESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt
