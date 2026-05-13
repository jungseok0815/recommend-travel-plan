import logging
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.domain.user.schema.userSchema import UserCreate, UserLogin, TokenResponse
from app.domain.user.schema.userSchema import UserCreate, UserLogin, TokenResponse, UserUpdate
from app.domain.user.services.userService import create_user, login_user, select_user, logout_user, is_email_taken, update_user
from app.domain.user.services.oauthService import get_naver_login_url, auth_naver_login, get_kakao_login_url, auth_kakao_login

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user")

@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    logger.info(f"이메일 중복 확인 - email: {email}")
    return {"available": not is_email_taken(db, email)}

@router.post("/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"회원가입 요청 - email: {user_data.email}")
    return create_user(db, user_data)

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"로그인 요청 - email: {user_data.email}")
    return login_user(db, user_data)

@router.get("/auth/naver")
def naver_login():
    logger.info("네이버 로그인 요청")
    return {"url": get_naver_login_url()}

@router.get("/auth/naver/callback")
def naver_callback(code: str, state: str, db: Session = Depends(get_db)):
    logger.info(f"네이버 콜백 - code: {code}, state: {state}")
    result = auth_naver_login(db, code)
    return RedirectResponse(
        url=f"travelplanner://auth/callback?access_token={result.access_token}&refresh_token={result.refresh_token}"
    )

@router.get("/auth/kakao")
def kakao_login():
    logger.info("카카오 로그인 요청")
    return {"url": get_kakao_login_url()}

@router.get("/auth/kakao/callback")
def kakao_callback(code: str, db: Session = Depends(get_db)):
    logger.info(f"카카오 콜백 - code: {code}")
    result = auth_kakao_login(db, code)
    return RedirectResponse(
        url=f"travelplanner://auth/callback?access_token={result.access_token}&refresh_token={result.refresh_token}"
    )

@router.get("/me")
def select(request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"유저 조회 요청 - user_id: {user_id}")
    return select_user(db, int(user_id))

@router.patch("/me")
def update(request: Request, user_data: UserUpdate, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"유저 수정 요청 - user_id: {user_id}")
    return update_user(db, int(user_id), user_data)

@router.post("/logout")
def logout(request: Request):
    user_id = request.state.user_id
    logger.info(f"로그아웃 요청 - user_id: {user_id}")
    logout_user(int(user_id))
    return {"message": "로그아웃 되었습니다"}


