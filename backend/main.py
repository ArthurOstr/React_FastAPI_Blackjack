import os
import jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from contextlib import asynccontextmanager

import database
import schemas
import auth
import BJ_classes


app = FastAPI(title="Async Blackjack API")
frontend_url = os.getenv("FRONTEND_URL", "https://blackjack-api-8pf8.onrender.com")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:5173",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


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


async def forfeit_active_games(user_id: int, db: AsyncSession):
    """Utility function to sweep and kill any dangling active game for a user."""
    reaper_smt = (
        update(database.GameState)
        .where(database.GameState.user_id == user_id)
        .where(database.GameState.status == "active")
        .values(status="forfeited")
    )
    await db.execute(reaper_smt)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with database.engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.create_all)
    yield


app = FastAPI(title="Async Blackjack API", lifespan=lifespan)


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
            detail="Username already taken. Try another",
        )
    # Hash the password in "str"
    hashed_pwd = auth.get_password_hash(user.password)
    # Create the db object
    new_user = database.User(
        username=user.username,
        password_hash=hashed_pwd,
        balance=1000.0,
        win_count=0,
        loss_count=0,
    )
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

    access_token = auth.create_access_token(data={"sub": db_user.username})

    return {"access_token": access_token, "token_type": "Bearer"}


@app.post("/bet", response_model=schemas.GameStateResponse)
async def place_bet(
    bet_request: schemas.BetRequest,
    current_user: database.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db),
):
    """
    Starts the game for the authenticated user
    """
    await forfeit_active_games(current_user.id, db)

    # Validate if the user has enough money
    if current_user.balance < bet_request.bet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient funds"
        )

    current_user.balance -= bet_request.bet

    game_deck = BJ_classes.Deck()
    player_hand = BJ_classes.Hand()
    dealer_hand = BJ_classes.Hand()

    for _ in range(2):
        player_hand.add_card(game_deck.draw())
        dealer_hand.add_card(game_deck.draw())

    new_game = database.GameState(
        user_id=current_user.id,
        deck=game_deck.serialize(),
        player_hand=player_hand.serialize(),
        dealer_hand=dealer_hand.serialize(),
        bet=bet_request.bet,
        status="active",
    )

    db.add(new_game)

    await db.commit()
    await db.refresh(new_game)

    return new_game


@app.post("/action", response_model=schemas.GameStateResponse)
async def game_action(
    action_request: schemas.GameActionRequest,
    current_user: database.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db),
):
    """Processes a Hit or Stand action for the user's active game"""

    # Fetch the user's active game
    query = select(database.GameState).where(
        database.GameState.user_id == current_user.id,
        database.GameState.status == "active",
    )
    result = await db.execute(query)
    game = result.scalars().first()

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active game found. Place a bet first",
        )

    # Unpack  the strings back into Python objects
    deck = BJ_classes.Deck.deserialize(game.deck)
    player_hand = BJ_classes.Hand.deserialize(game.player_hand)
    dealer_hand = BJ_classes.Hand.deserialize(game.dealer_hand)

    # Game Logic
    if action_request.action == "hit":
        player_hand.add_card(deck.draw())
        if player_hand.get_value() > 21:
            game.status = "lost"
            current_user.loss_count += 1

    elif action_request.action == "stand":
        while dealer_hand.get_value() < 17:
            dealer_hand.add_card(deck.draw())

        player_score = player_hand.get_value()
        dealer_score = dealer_hand.get_value()

        if dealer_score > 21 or player_score > dealer_score:
            game.status = "won"
            current_user.balance += game.bet * 2
            current_user.win_count += 1

        elif player_score < dealer_score:
            game.status = "lost"
            current_user.loss_count += 1
        else:
            current_user.balance += game.bet
            game.status = "push"
    else:
        raise HTTPException(
            status_code=400, detail="Invalid action. Use 'hit' or 'stand'"
        )

    game.deck = deck.serialize()
    game.player_hand = player_hand.serialize()
    game.dealer_hand = dealer_hand.serialize()

    await db.commit()
    await db.refresh(game)

    return game


@app.get("/me")
async def get_user_status(
    current_user: database.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db),
):
    query = select(database.GameState).where(
        database.GameState.user_id == current_user.id,
        database.GameState.status == "active",
    )
    result = await db.execute(query)
    active_game = result.scalars().first()

    return {
        "username": current_user.username,
        "balance": current_user.balance,
        "win_count": current_user.win_count,
        "loss_count": current_user.loss_count,
        "active_game": active_game,
    }


@app.post("/logout")
async def logout(
    current_user: database.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db),
):
    await forfeit_active_games(current_user.id, db)

    await db.commit()
    return {
        "message": "Server state cleaned. JWT can be destroyed.",
        "status": "success",
    }
