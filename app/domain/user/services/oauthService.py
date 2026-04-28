import secrets
import httpx
from urllib.parse import urlencode
from app.core.config import NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_REDIRECT_URI


def get_naver_login_url() -> str:
    params = {
        "client_id"    : NAVER_CLIENT_ID,
        "redirect_uri" : NAVER_REDIRECT_URI,
        "response_type": "code",
        "state"        : secrets.token_urlsafe(16),
    }
    return f"https://nid.naver.com/oauth2.0/authorize?{urlencode(params)}"

def auth_naver_login(code: str, state: str):
    logger.info(f"code : {code}, state : {state}")
    naver_access_token = exchange_code_for_token(code)
    profile = get_naver_profile(naver_access_token)

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
    header = {"Authorization": f"Bearer {access_token}"}
    response = httpx.get("https://openapi.naver.com/v1/nid/me", headers=headers)
    return response.json()["response"]