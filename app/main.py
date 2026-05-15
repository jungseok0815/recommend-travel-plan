import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.security import decode_token, create_access_token, create_refresh_token
from app.domain.user.routers.userRouter import router as user_router
from app.domain.trip.routers.tripRouter import router as trip_router
from app.domain.preference.routers.preferenceRouter import router as preference_router
from app.dependencies.auth import verify_refresh_token
from app.db.redis import set_refresh_token
from app.db.database import Base, engine
from app.domain.user.models.userModel import User
from app.domain.user.models.socialAccountModel import SocialAccount
from app.domain.trip.models.tripModel import Trip, TripDay, TripSchedule, TripReview, TripParticipant
from app.domain.preference.models.preferenceModel import Preference

@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(user_router)
app.include_router(trip_router)
app.include_router(preference_router)


logging.basicConfig(
  level=logging.INFO,
  format="%(asctime)s %(levelname)s %(name)s - %(message)s"
)


@app.get("/")
def root():
    return {"message" : "hello fastapi"}


PUBLIC_PATHS = [
      "/",
      "/user/login",
      "/user/signup",
      "/user/check-email",
      "/user/token/refresh",
      "/user/auth/naver",
      "/user/auth/naver/callback",
      "/user/auth/kakao",
      "/user/auth/kakao/callback",
      "/preference/options",
      "/docs",
      "/redoc",
      "/openapi.json"
]

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    if request.method == "OPTIONS" or request.url.path in PUBLIC_PATHS:
        return await call_next(request)

    authorization = request.headers.get("Authorization")

    if not authorization or not authorization.startswith("Bearer "):
         return JSONResponse(status_code=401, content={"detail": "토큰이 없습니다"})

    access_token = authorization.split(" ")[1]
    refresh_token = request.headers.get("Refresh-Token")

    logging.info("access_token : %s", access_token)
    logging.info("refresh_token : %s", refresh_token)
    access_result = decode_token(access_token)

    logging.info(f"access_result : {access_result}")

    if access_result["status"] == "valid":
        request.state.user_id = access_result["payload"].get("sub")
        return await call_next(request)

    if access_result["status"] == "invalid":
        return JSONResponse(status_code=401,content={"detail": "유효하지 않은 토큰입니다", "code": "TOKEN_INVALID"})

    if access_result["status"] == "expired":
        if not refresh_token:
            logging.info(f"not use refresh token")
            return JSONResponse(status_code=401, content={"detail" : "재로그인이 필요합니다"})

        user_id = verify_refresh_token(refresh_token)
        if user_id is None:
            logging.info(f"expired refresh token")
            return JSONResponse(status_code=401, content={"detail": "재로그인이 필요합니다"})
        logging.info(f"not use refresh token{user_id}")
        new_access_token = create_access_token({"sub" : user_id})
        new_refresh_token = create_refresh_token({"sub" : user_id})
        set_refresh_token(int(user_id), new_refresh_token)

        request.state.user_id = user_id

        response = await call_next(request)
        response.headers["New-Access-Token"] = new_access_token
        response.headers["New-Refresh-Token"] = new_refresh_token
        return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:19006",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
