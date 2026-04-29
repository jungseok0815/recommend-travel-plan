from dotenv import load_dotenv
import os

ENV = os.getenv("ENV", "local")
load_dotenv(f".env.{ENV}")

DATABASE_URL = os.getenv("DATABASE_URL", "")
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080"))
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

NAVER_CLIENT_ID     = os.getenv("NAVER_CLIENT_ID", "")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET", "")
NAVER_REDIRECT_URI  = os.getenv("NAVER_REDIRECT_URI", "")

KAKAO_CLIENT_ID    = os.getenv("KAKAO_CLIENT_ID", "")
KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI", "")

TOUR_API_KEY = os.getenv("TOUR_API_KEY", "")

KAKAO_MOBILITY_API_KEY = os.getenv("KAKAO_MOBILITY_API_KEY", "")