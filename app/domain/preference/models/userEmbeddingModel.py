from sqlalchemy import Column, Integer, ForeignKey, Text
from app.db.database import Base


class UserEmbedding(Base):
    __tablename__ = "USER_EMBEDDINGS"

    id                      = Column(Integer, primary_key=True, index=True)
    user_id                 = Column(Integer, ForeignKey("USERS.id"), nullable=False, unique=True)
    travel_embedding        = Column(Text, nullable=True)  # 여행 취향 벡터 JSON (관광지/레포츠/쇼핑 필터링)
    food_embedding          = Column(Text, nullable=True)  # 음식 취향 벡터 JSON
    accommodation_embedding = Column(Text, nullable=True)  # 숙박 취향 벡터 JSON
