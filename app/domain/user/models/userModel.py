from sqlalchemy import Column, Integer, String
from app.common.db.database import Base

class User(Base):
    __tablename__ = "USERS"
    id       = Column(Integer, primary_key=True, index=True)
    email    = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=True)
    address  = Column(String(255), nullable=True)
