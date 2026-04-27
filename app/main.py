import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.security import decode_access_token
from app.domain.user.routers.userRouter import router as user_router
from app.domain.trip.routers.tripRouter import router as trip_router
from app.domain.preference.routers.preferenceRouter import router as preference_router

app = FastAPI()
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
      "/user/token/refresh",
]

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    if request.url.path in PUBLIC_PATHS:
        return await call_next(request)

    authorization = request.headers.get("Authorization")

    if not authorization or not authorization.startswith("Bearer "):
         return JSONResponse(status_code=401, content={"detail": "토큰이 없습니다"})

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if payload is None:
      return JSONResponse(status_code=401, content={"detail": "유효하지 않은 토큰입니다"})

    request.state.user_id = payload.get("sub")
    return await call_next(request)