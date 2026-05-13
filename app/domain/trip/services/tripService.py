import logging
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.domain.trip.models.tripModel import Trip, TripDay, TripSchedule, TripReview
from app.domain.trip.schema.tripSchema import TripCreate, TripResponse, TripReviewCreate
from app.domain.user.models.userModel import User

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
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


def get_trip_list(db: Session, user_id: int) -> list[TripResponse]:
    logger.info(f"여행 일정 목록 조회 - user_id: {user_id}")
    return (
        db.query(Trip)
        .options(joinedload(Trip.days).joinedload(TripDay.schedules))
        .filter(Trip.user_id == user_id)
        .all()
    )


def get_trip(db: Session, user_id: int, trip_id: int) -> TripResponse:
    logger.info(f"여행 일정 조회 - user_id: {user_id}, trip_id: {trip_id}")
    trip = (
        db.query(Trip)
        .options(joinedload(Trip.days).joinedload(TripDay.schedules))
        .filter(Trip.id == trip_id, Trip.user_id == user_id)
        .first()
    )
    if trip is None:
        raise HTTPException(status_code=404, detail="여행 일정을 찾을 수 없습니다")
    return trip


def get_community_trips(db: Session, user_id: int) -> list[dict]:
    logger.info(f"커뮤니티 여행 목록 조회 - user_id: {user_id}")
    rows = (
        db.query(Trip, User.email)
        .join(User, Trip.user_id == User.id)
        .filter(Trip.user_id != user_id)
        .order_by(Trip.id.desc())
        .all()
    )

    result = []
    for trip, email in rows:
        days_data = []
        for day in trip.days:
            days_data.append({
                "id": day.id,
                "day": day.day,
                "date": day.date,
                "day_cost": day.day_cost,
                "schedules": [
                    {
                        "id": s.id,
                        "time": s.time,
                        "activity": s.activity,
                        "location": s.location,
                        "transport": s.transport,
                        "duration": s.duration,
                        "cost": s.cost,
                        "remaining_budget": s.remaining_budget,
                        "note": s.note,
                    }
                    for s in day.schedules
                ],
            })
        result.append({
            "id": trip.id,
            "destination": trip.destination,
            "transport": trip.transport,
            "start_datetime": trip.start_datetime,
            "end_datetime": trip.end_datetime,
            "group_size": trip.group_size,
            "budget": trip.budget,
            "total_cost": trip.total_cost,
            "status": trip.status,
            "user_email": email,
            "days": days_data,
        })
    return result


def create_or_update_review(db: Session, user_id: int, trip_id: int, review_data: TripReviewCreate) -> TripReview:
    logger.info(f"리뷰 작성/수정 - user_id: {user_id}, trip_id: {trip_id}")
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="여행 일정을 찾을 수 없습니다")
    if trip.status != '완료':
        raise HTTPException(status_code=400, detail="완료된 여행만 리뷰를 작성할 수 있습니다")

    review = db.query(TripReview).filter(TripReview.trip_id == trip_id).first()
    if review:
        review.rating  = review_data.rating
        review.content = review_data.content
    else:
        review = TripReview(
            trip_id = trip_id,
            user_id = user_id,
            rating  = review_data.rating,
            content = review_data.content,
        )
        db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_review(db: Session, user_id: int, trip_id: int) -> TripReview:
    logger.info(f"리뷰 조회 - user_id: {user_id}, trip_id: {trip_id}")
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="여행 일정을 찾을 수 없습니다")
    review = db.query(TripReview).filter(TripReview.trip_id == trip_id).first()
    if review is None:
        raise HTTPException(status_code=404, detail="리뷰가 없습니다")
    return review
