from sqlalchemy.orm import Session
from app.domain.user.models.userModel import User
from app.domain.user.schema.userSchema import UserCreate,UserLogin,UserResponse, TokenResponse
from app.utils.hash import hash_password, verify_password
from app.core.security import create_access_token
from fastapi import HTTPException


def create_user(db: Session, user_data: UserCreate) -> UserResponse:
    user= User(
        email = user_data.email,
        password = hash_password(user_data.password),
        address = user_data.address
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def login_user(db: Session, user_data: UserLogin) -> TokenResponse:
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다")

    token = create_access_token(data= {"sub": str(user.id)})
    return TokenResponse(access_token= token, token_type="bearer")

def select_user(db: Session, user_data: UserLogin) -> TokenResponse:
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다")

    token = create_access_token(data= {"sub": str(user.id)})
    return TokenResponse(access_token= token, token_type="bearer")


