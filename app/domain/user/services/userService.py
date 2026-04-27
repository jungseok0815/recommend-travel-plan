from sqlalchemy.orm import Session
from app.domain.user.models.userModel import User
from app.domain.user.schema.userSchema import UserCreate,UserLogin,UserResponse
from app.utils.hash import hash_password

def create_user(db: Session, user_data: UserCreate) -> UserResponse:
    user= User(
        email = user_data.email,
        password = hash_password(user_data.password)
        address = user_data.address
    )
    db.add(user)
    db.commit()
    db.refresh()
    return user

def login_user(db: Session, user_data: UserLogin) -> UserResponse:
    return user


