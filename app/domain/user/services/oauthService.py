import logging
import secrets
import httpx
from urllib.parse import urlencode
from sqlalchemy.orm import Session
from app.core.config import NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_REDIRECT_URI
from app.core.security import create_access_token, create_refresh_token
from app.db.redis import set_refresh_token
from app.domain.user.schema.userSchema import TokenResponse
from app.domain.user.services.userService import get_or_create_social_user

logger = logging.getLogger(__name__)


def get_naver_login_url() -> str:
    params = {
        "client_id"    : NAVER_CLIENT_ID,
        "redirect_uri" : NAVER_REDIRECT_URI,
        "response_type": "code",
        "state"        : secrets.token_urlsafe(16),
    }
    return f"https://nid.naver.com/oauth2.0/authorize?{urlencode(params)}"


def exchange_code_for_token(code: str) -> str:
    params = {
        "grant_type"   : "authorization_code",
        "client_id"    : NAVER_CLIENT_ID,
        "client_secret": NAVER_CLIENT_SECRET,
        "redirect_uri" : NAVER_REDIRECT_URI,
        "code"         : code,
    }
    response = httpx.get("https://nid.naver.com/oauth2.0/token", params=params)
    return response.json()["access_token"]


def get_naver_profile(access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    response = httpx.get("https://openapi.naver.com/v1/nid/me", headers=headers)
    return response.json()["response"]


def auth_naver_login(db: Session, code: str) -> TokenResponse:
    logger.info("네이버 로그인 처리")
    naver_access_token = exchange_code_for_token(code)
    profile = get_naver_profile(naver_access_token)

    logger.info(f"네이버 프로필 조회 - email: {profile['email']}")

    user = get_or_create_social_user(
        db,
        email       = profile["email"],
        provider    = "naver",
        provider_id = profile["id"],
    )

    access_token  = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    set_refresh_token(user.id, refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")
