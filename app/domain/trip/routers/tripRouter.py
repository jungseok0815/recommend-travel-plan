import logging
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.domain.trip.schema.tripSchema import TripCreate, TripResponse, CommunityTripResponse
from app.domain.trip.services.tripService import create_trip, get_trip_list, get_trip, get_community_trips

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trip")


@router.post("", response_model=TripResponse)
def create(request: Request, trip_data: TripCreate, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"POST /trip - user_id: {user_id}")
    return create_trip(db, int(user_id), trip_data)


@router.get("", response_model=list[TripResponse])
def get_list(request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"GET /trip - user_id: {user_id}")
    return get_trip_list(db, int(user_id))


@router.get("/community", response_model=list[CommunityTripResponse])
def get_community(request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"GET /trip/community - user_id: {user_id}")
    return get_community_trips(db, int(user_id))


@router.get("/{trip_id}", response_model=TripResponse)
def get_one(trip_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"GET /trip/{trip_id} - user_id: {user_id}")
    return get_trip(db, int(user_id), trip_id)
