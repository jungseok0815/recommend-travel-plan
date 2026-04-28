from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class SocialAccount(Base):
    __tablename__ = "SocialAccounts"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("Users.id"), nullable=False)
    provider    = Column(String(20), nullable=False)    # "naver" | "kakao" | "google"
    provider_id = Column(String(100), nullable=False)   # 각 provider의 고유 유저 ID

    user = relationship("User", backref="social_accounts")
