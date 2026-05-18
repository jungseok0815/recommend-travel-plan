from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.db.database import Base

class Preference(Base):
    __tablename__ = "PREFERENCES"
    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("USERS.id"), nullable=False)
    travel_priority    = Column(String(50),  nullable=False)  # 'A01,A03,A02,A04' (순위 순서)
    sub_A01            = Column(String(500), nullable=True)   # 자연 세부 cat 코드 CSV
    sub_A02            = Column(String(500), nullable=True)   # 인문 세부 cat 코드 CSV
    sub_A03            = Column(String(500), nullable=True)   # 레포츠 세부 cat 코드 CSV
    sub_A04            = Column(String(500), nullable=True)   # 쇼핑 세부 cat 코드 CSV
    food_types         = Column(String(500), nullable=True)   # 음식 타입 CSV
    accommodation_type = Column(String(500), nullable=True)   # 숙박 타입 CSV
    embedding          = Column(Text,        nullable=True)   # JSON 직렬화된 768차원 벡터
