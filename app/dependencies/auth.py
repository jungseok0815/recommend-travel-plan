from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_token, get_refresh_token
from app.domain.user.models.userModel import User

oauth2_schema = OAuth2PasswordBearer(tokenUrl="/user/login")

def get_current_user(token: str = Depends(oauth2_schema), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(status_code=401, detail="존재하지 않는 유저입니다")

    return user

def verify_refresh_token(refresh_token: str):
    refresh_result = decode_token(refresh_token)
    if refresh_result["status"] != "valid":
        return None

    user_id = refresh_result["payload"].get("sub")
    saved_token = get_refresh_token(int(user_id))

    if status_code != refresh_token:
        return None
    return user_id