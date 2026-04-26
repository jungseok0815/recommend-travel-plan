from fastapi import APIRouter
from app.domain.recommend.services.recommend import get_travel_recommend

router = APIRouter()

@router.get("/travel/recommend")
def travel_recommend():
    return get_travel_recommend()
