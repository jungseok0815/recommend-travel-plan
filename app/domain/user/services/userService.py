import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.domain.user.models.userModel import User
from app.domain.user.models.socialAccountModel import SocialAccount
from app.domain.user.schema.userSchema import UserCreate, UserLogin, UserResponse, TokenResponse, UserUpdate
from app.utils.hash import hash_password, verify_password
from app.common.core.security import create_access_token, create_refresh_token
from app.common.db.redis import set_refresh_token, delete_refresh_token

logger = logging.getLogger(__name__)


def is_email_taken(db: Session, email: str) -> bool:
    return db.query(User).filter(User.email == email).first() is not None


def create_user(db: Session, user_data: UserCreate) -> UserResponse:
    logger.info(f"유저 생성 - email: {user_data.email}")
    if is_email_taken(db, user_data.email):
        raise HTTPException(status_code=409, detail="이미 사용 중인 이메일입니다")
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

def update_user(db: Session, user_id: int, user_data: UserUpdate) -> UserResponse:
    logger.info(f"유저 수정 - user_id: {user_id}")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다")
    user.address = user_data.address
    db.commit()
    db.refresh(user)
    return user


def get_or_create_social_user(db: Session, email: str, provider: str, provider_id: str) -> User:
    social = db.query(SocialAccount).filter(
        SocialAccount.provider    == provider,
        SocialAccount.provider_id == provider_id
    ).first()

    if social:
        return social.user

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password=None, address=None)
        db.add(user)
        db.flush()

    social = SocialAccount(user_id=user.id, provider=provider, provider_id=provider_id)
    db.add(social)
    db.commit()
    db.refresh(user)
    return user






