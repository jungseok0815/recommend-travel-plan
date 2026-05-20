import logging
import redis
from app.common.core.config import REDIS_URL, REFRESH_TOKEN_EXPIRE_MINUTES

logger = logging.getLogger(__name__)

redis_client = redis.from_url(REDIS_URL, decode_responses=True)


def set_refresh_token(user_id: int, refresh_token: str):
    key = f"refresh_token:{user_id}"
    redis_client.setex(key, REFRESH_TOKEN_EXPIRE_MINUTES * 60, refresh_token)


def get_refresh_token(user_id: int) -> str:
    key = f"refresh_token:{user_id}"
    return redis_client.get(key)


def delete_refresh_token(user_id: int):
    key = f"refresh_token:{user_id}"
    redis_client.delete(key)
