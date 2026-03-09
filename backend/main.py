from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession 
from sqalchemy.future import select

import database
import schemas 
import auth 

app = FastAPI(title="Async Blackjack API")

@app.get("/")
async def root():
    """Check if the server is alive."""
    return {"message": "Blackjack API is running"}

@app.post("/register", response_model=schemas.UserResponse)
async def register_user(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    """Registers a new user and saves them"""
    # Checks if the username was taken
    query = select(database.User).where(database.User.username == user.username)
    result = await db.execute(query)
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken. Try another another"
        )
    # Hash the password in "str"
    hashed_pwd = auth.get_password_hash(user.password)
    # Create the db object
    new_user = database.User(username=user.username, password_hash=hashed_pwd)
    db.add(new_user)
    await db.commit()
    # Refresh grabs
    await db.refresh(new_user)

    return new_user

@app.post("/login")
async def login(user: schemas:)
