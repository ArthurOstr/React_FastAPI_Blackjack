import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Numeric

# Define the Database Url
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://user:passwoord@db:5432/blackjack"
)
# create_async_engine
engine = create_async_engine(DATABASE_URL, echo=True)
# create_session_factory
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass

    # Dependency for FastAPI


async def get_db():
    async with async_session() as session:
        yield session


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    balance: Mapped[float] = mapped_column(Numeric(10, 2), default=1000.00)


class GameState(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    deck: Mapped[str] = mapped_column(String)
    player_hand: Mapped[str] = mapped_column(String)
    dealer_hand: Mapped[str] = mapped_column(String)
    bet: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(20), default="active")
