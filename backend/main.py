import jwt
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

import database
import schemas
import auth

app = FastAPI(title="Async Blackjack API")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    query = select(database.User).where(database.User.username == username)
    result = await db.execute(query)
    user = result.scalars().first()

    if user is None:
        raise credentials_exception

    return user


@app.get("/")
async def root():
    """Check if the server is alive."""
    return {"message": "Blackjack API is running"}


@app.post("/register", response_model=schemas.UserResponse)
async def register_user(
    user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)
):
    """Registers a new user and saves them"""
    # Checks if the username was taken
    query = select(database.User).where(database.User.username == user.username)
    result = await db.execute(query)
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken. Try another another",
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
async def login(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):

    query = select(database.User).where(database.User.username == user.username)
    result = await db.execute(query)
    db_user = result.scalars().first()

    if not db_user or not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    acess_token = auth.create_acess_token(data={"sub": db_user.username})

    return {"access_token": acess_token, "token_type": "Bearer"}


@app.post("/bet", response_model=schemas.GameStateResponse)
async def place_bet(
    bet_request: schemas.BetRequest,
    current_user: database.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db),
):
    """Starts the game for the authenticated user."""

    # Validate if the user has enough money
    if current_user.balance < bet_request.bet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient funds"
        )

    current_user.balance -= bet_request.bet

    # TODO: Store the deck inside db

    serialized_deck = "mock_deck"
    player_staring_hand = "mock_player_cards"
    dealer_starting_hand = "mock_player_cards"

    new_game = database.GameState(
        user_id=current_user.id,
        deck=serialized_deck,
        player_hand=player_staring_hand,
        dealer_hand=dealer_starting_hand,
        bet=bet_request.bet,
        status="active",
    )

    db.add(new_game)

    await db.commit()
    await db.refresh(new_game)

    return new_game
