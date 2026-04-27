import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.domain.trip.models.tripModel import Trip
from app.domain.trip.schema.tripSchema import TripCreate, TripResponse

logger = logging.getLogger(__name__)


def create_trip(db: Session, user_id: int, trip_data: TripCreate) -> TripResponse:
    logger.info(f"여행 일정 생성 - user_id: {user_id}, destination: {trip_data.destination}")
    trip = Trip(
        user_id        = user_id,
        destination    = trip_data.destination,
        transport      = trip_data.transport,
        start_datetime = trip_data.start_datetime,
        end_datetime   = trip_data.end_datetime,
        group_size     = trip_data.group_size,
        budget         = trip_data.budget,
        itinerary      = None
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


def get_trip_list(db: Session, user_id: int) -> list[TripResponse]:
    logger.info(f"여행 일정 목록 조회 - user_id: {user_id}")
    return db.query(Trip).filter(Trip.user_id == user_id).all()


def get_trip(db: Session, user_id: int, trip_id: int) -> TripResponse:
    logger.info(f"여행 일정 조회 - user_id: {user_id}, trip_id: {trip_id}")
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="여행 일정을 찾을 수 없습니다")
    return trip
