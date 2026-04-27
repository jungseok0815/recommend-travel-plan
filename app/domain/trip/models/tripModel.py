from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.db.database import Base

class Trip(Base):
    __tablename__ = "Trips"
    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("Users.id"), nullable=False)
    destination    = Column(String(100), nullable=False)
    transport      = Column(String(50), nullable=False)
    start_datetime = Column(String(50), nullable=False)
    end_datetime   = Column(String(50), nullable=False)
    group_size     = Column(Integer, nullable=False)
    budget         = Column(Integer, nullable=False)
    itinerary      = Column(Text, nullable=True)
