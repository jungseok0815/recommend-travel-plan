import logging
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.common.db.database import get_db
from app.common.core.security import decode_token
from app.common.db.redis import get_refresh_token
from app.domain.user.models.userModel import User

logger = logging.getLogger(__name__)

def verify_refresh_token(refresh_token: str):
    refresh_result = decode_token(refresh_token)
    if refresh_result["status"] != "valid":
        return None
    
    user_id = refresh_result["payload"].get("sub")
    saved_token = get_refresh_token(int(user_id))
    logger.info("user_id : %s", user_id)
    logger.info("saved_token : %s", saved_token)
    if saved_token != refresh_token:
        return None
    return user_id


