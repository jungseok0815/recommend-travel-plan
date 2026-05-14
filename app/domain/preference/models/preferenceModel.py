from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base

class Preference(Base):
    __tablename__ = "Preferences"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("Users.id"), nullable=False)
    travel_style     = Column(String(200), nullable=False)
    environment      = Column(String(50),  nullable=False)
    accommodation    = Column(String(200), nullable=False)
    interest         = Column(String(200), nullable=False)
    travel_frequency = Column(String(50),  nullable=False)
