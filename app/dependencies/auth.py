from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_access_token
from app.domain.user.models.userModel import User

oauth2_schema = OAuth2PasswordBearer(tokenUrl="/user/login")

def get_current_user(token: str = Depends(oauth2_schema), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(status_code=401, detail="존재하지 않는 유저입니다")

    return user
