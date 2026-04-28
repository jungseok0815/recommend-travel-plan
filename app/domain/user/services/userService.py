import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.domain.user.models.userModel import User
from app.domain.user.schema.userSchema import UserCreate, UserLogin, UserResponse, TokenResponse
from app.utils.hash import hash_password, verify_password
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.db.redis import set_refresh_token, get_refresh_token, delete_refresh_token

logger = logging.getLogger(__name__)


def create_user(db: Session, user_data: UserCreate) -> UserResponse:
    logger.info(f"유저 생성 - email: {user_data.email}")
    user = User(
        email=user_data.email,
        password=hash_password(user_data.password),
        address=user_data.address
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, user_data: UserLogin) -> TokenResponse:
    logger.info(f"로그인 처리 - email: {user_data.email}")
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다")

    access_token  = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    set_refresh_token(user.id, refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


def logout_user(user_id: int):
    logger.info(f"로그아웃 - user_id: {user_id}")
    delete_refresh_token(user_id)


def select_user(db: Session, user_id: int) -> UserResponse:
    logger.info(f"유저 조회 - user_id: {user_id}")
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다")

    return user
