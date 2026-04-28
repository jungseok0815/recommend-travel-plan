import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.security import decode_token, create_access_token
from app.domain.user.routers.userRouter import router as user_router
from app.domain.trip.routers.tripRouter import router as trip_router
from app.domain.preference.routers.preferenceRouter import router as preference_router
form app.dependencies.auth import auth as verify_refresh_token

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
        refresh_result = decode_token(refresh_token)
        if refresh_result["status"] != "valid":
            return JSONResponse(status_code=401, content={"detail" : "유효하지 않은 토큰입니다", "code": "TOKEN_INVALID"})

        user_id = verify_refresh_token(refresh_token)


        user_id = refresh_result["payload"].get("sub")
        new_access_token = create_access_token({"sub" : user_id})
        request.state.user_id = user_id
        response.headers["New-Access-Token"] = new_access_token
        response = await call_next(request)
        return response










    request.state.user_id = payload.get("sub")
    return await call_next(request)