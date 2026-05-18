from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base

class Preference(Base):
    __tablename__ = "PREFERENCES"
    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("USERS.id"), nullable=False)
    travel_priority    = Column(String(50),  nullable=False)
    sub_A01            = Column(String(500), nullable=True)
    sub_A02            = Column(String(500), nullable=True)
    sub_A03            = Column(String(500), nullable=True)
    sub_A04            = Column(String(500), nullable=True)
    food_types         = Column(String(500), nullable=True)
    accommodation_type = Column(String(500), nullable=True)
