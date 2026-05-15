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
from app.db.database import Base, engine, SessionLocal
from app.domain.preference.models.preferenceOptionModel import PreferenceCategory, PreferenceOption
from app.domain.user.models.userModel import User
from app.domain.user.models.socialAccountModel import SocialAccount
from app.domain.trip.models.tripModel import Trip, TripDay, TripSchedule, TripReview, TripParticipant
from app.domain.preference.models.preferenceModel import Preference
from app.domain.preference.models.preferenceOptionModel import PreferenceCategory, PreferenceOption

PREFERENCE_SEED = [
    {
        "key": "travel_style", "title": "여행 스타일", "subtitle": "선호하는 여행 스타일을 선택하세요 (중복 가능)",
        "multi_select": True, "sort_order": 1,
        "options": [
            {"value": "힐링",    "label": "힐링",    "icon": "leaf-outline",      "description": "조용하고 여유로운 힐링 여행", "sort_order": 1},
            {"value": "액티비티", "label": "액티비티", "icon": "bicycle-outline",   "description": "활동적인 스포츠·레저 중심",  "sort_order": 2},
            {"value": "관광",    "label": "관광",    "icon": "camera-outline",     "description": "명소·유적지 탐방 위주",      "sort_order": 3},
            {"value": "맛집",    "label": "맛집",    "icon": "restaurant-outline", "description": "현지 음식·맛집 탐방 중심",  "sort_order": 4},
        ],
    },
    {
        "key": "environment", "title": "선호 환경", "subtitle": "어떤 환경을 선호하시나요?",
        "multi_select": False, "sort_order": 2,
        "options": [
            {"value": "자연", "label": "자연", "icon": "trail-sign-outline", "description": "산·바다·숲 등 자연 속 여행", "sort_order": 1},
            {"value": "도심", "label": "도심", "icon": "business-outline",   "description": "도시·번화가 중심 여행",      "sort_order": 2},
        ],
    },
    {
        "key": "accommodation", "title": "숙박 유형", "subtitle": "선호하는 숙박 형태를 선택하세요 (중복 가능)",
        "multi_select": True, "sort_order": 3,
        "options": [
            {"value": "호텔",       "label": "호텔",       "icon": "bed-outline",     "description": "편리한 호텔·리조트",          "sort_order": 1},
            {"value": "펜션",       "label": "펜션",       "icon": "home-outline",    "description": "아늑한 펜션·풀빌라",          "sort_order": 2},
            {"value": "게스트하우스", "label": "게스트하우스", "icon": "people-outline",  "description": "저렴하고 소통하는 게스트하우스", "sort_order": 3},
            {"value": "캠핑",       "label": "캠핑",       "icon": "bonfire-outline", "description": "자연 속 캠핑·글램핑",         "sort_order": 4},
        ],
    },
    {
        "key": "interest", "title": "관심사", "subtitle": "여행에서 중요하게 생각하는 것을 선택하세요 (중복 가능)",
        "multi_select": True, "sort_order": 4,
        "options": [
            {"value": "사진",     "label": "사진",     "icon": "image-outline",   "description": "인생샷·감성 사진 촬영",  "sort_order": 1},
            {"value": "역사",     "label": "역사",     "icon": "library-outline", "description": "역사·문화 유적지 탐방",  "sort_order": 2},
            {"value": "카페",     "label": "카페",     "icon": "cafe-outline",    "description": "분위기 있는 카페 투어",  "sort_order": 3},
            {"value": "쇼핑",     "label": "쇼핑",     "icon": "bag-outline",     "description": "쇼핑·기념품 구매",      "sort_order": 4},
            {"value": "로컬 문화", "label": "로컬 문화", "icon": "earth-outline",   "description": "현지 문화·축제 체험",   "sort_order": 5},
        ],
    },
    {
        "key": "travel_frequency", "title": "여행 빈도", "subtitle": "평균적으로 얼마나 자주 여행하시나요?",
        "multi_select": False, "sort_order": 5,
        "options": [
            {"value": "월 1회",   "label": "월 1회",   "icon": "calendar-outline", "description": "한 달에 한 번 이상",  "sort_order": 1},
            {"value": "분기 1회", "label": "분기 1회", "icon": "calendar-outline", "description": "3개월에 한 번 정도", "sort_order": 2},
            {"value": "연 1~2회", "label": "연 1~2회", "icon": "calendar-outline", "description": "1년에 한두 번",      "sort_order": 3},
        ],
    },
]


def _seed_preference_categories(db):
    if db.query(PreferenceCategory).first():
        return
    for c in PREFERENCE_SEED:
        category = PreferenceCategory(
            key=c["key"], title=c["title"], subtitle=c["subtitle"],
            multi_select=c["multi_select"], sort_order=c["sort_order"],
        )
        db.add(category)
        db.flush()
        for o in c["options"]:
            db.add(PreferenceOption(
                category_id=category.id, value=o["value"], label=o["label"],
                icon=o["icon"], description=o["description"], sort_order=o["sort_order"],
            ))
    db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed_preference_categories(db)
    finally:
        db.close()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    access_result = decode_token(access_token)

    if access_result["status"] == "valid":
        request.state.user_id = access_result["payload"].get("sub")
        return await call_next(request)

    if access_result["status"] == "invalid":
        return JSONResponse(status_code=401,content={"detail": "유효하지 않은 토큰입니다", "code": "TOKEN_INVALID"})

    if access_result["status"] == "expired":
        if not refresh_token:
            return JSONResponse(status_code=401, content={"detail" : "재로그인이 필요합니다"})

        user_id = verify_refresh_token(refresh_token)
        if user_id is None:
            return JSONResponse(status_code=401, content={"detail": "재로그인이 필요합니다"})

        new_access_token = create_access_token({"sub" : user_id})
        new_refresh_token = create_refresh_token({"sub" : user_id})
        set_refresh_token(int(user_id), new_refresh_token)

        request.state.user_id = user_id

        response = await call_next(request)
        response.headers["New-Access-Token"] = new_access_token
        response.headers["New-refresh-Token"] = new_refresh_token
        return response
