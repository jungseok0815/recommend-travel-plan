from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_token
from app.db.redis import get_refresh_token
from app.domain.user.models.userModel import User

def verify_refresh_token(refresh_token: str):
    refresh_result = decode_token(refresh_token)
    if refresh_result["status"] != "valid":
        return None

    user_id = refresh_result["payload"].get("sub")
    saved_token = get_refresh_token(int(user_id))

    if saved_token != refresh_token:
        return None
    return user_id