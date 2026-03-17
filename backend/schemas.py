from pydantic import BaseModel, ConfigDict
from decimal import Decimal


# Schemas for Auth
class UserCreate(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    balance: Decimal
    win_count: int
    loss_count: int


# Schemas for the game: INBOUND
class BetRequest(BaseModel):
    bet: Decimal


class GameActionRequest(BaseModel):
    action: str


# Schemas for the game: OUTBOUND
class GameStateResponse(BaseModel):
    id: int
    player_hand: str
    dealer_hand: str
    bet: Decimal
    status: str

    # Tells Pydantic to read these fields directly from your SQLAlchemy GameState object
    model_config = ConfigDict(from_attributes=True)
