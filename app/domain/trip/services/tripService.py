import logging
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException
from app.domain.trip.models.tripModel import Trip, TripDay, TripSchedule, TripReview, TripParticipant
from app.domain.trip.schema.tripSchema import TripCreate, TripResponse, TripReviewCreate, ParticipantResponse
from app.domain.user.models.userModel import User

logger = logging.getLogger(__name__)


def _is_accessible(db: Session, trip: Trip, user_id: int) -> bool:
    if trip.user_id == user_id:
        return True
    return db.query(TripParticipant).filter(
        TripParticipant.trip_id == trip.id,
        TripParticipant.user_id == user_id,
    ).first() is not None


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
    db.flush()

    for email in trip_data.participant_emails:
        target = db.query(User).filter(User.email == email).first()
        if target is None or target.id == user_id:
            continue
        already = db.query(TripParticipant).filter(
            TripParticipant.trip_id == trip.id,
            TripParticipant.user_id == target.id,
        ).first()
        if not already:
            db.add(TripParticipant(trip_id=trip.id, user_id=target.id))

    db.commit()
    db.refresh(trip)
    return trip


def get_trip_list(db: Session, user_id: int) -> list[TripResponse]:
    logger.info(f"여행 일정 목록 조회 - user_id: {user_id}")
    return (
        db.query(Trip)
        .options(joinedload(Trip.days).joinedload(TripDay.schedules))
        .outerjoin(TripParticipant, Trip.id == TripParticipant.trip_id)
        .filter(or_(Trip.user_id == user_id, TripParticipant.user_id == user_id))
        .distinct()
        .all()
    )


def get_trip(db: Session, user_id: int, trip_id: int) -> TripResponse:
    logger.info(f"여행 일정 조회 - user_id: {user_id}, trip_id: {trip_id}")
    trip = (
        db.query(Trip)
        .options(joinedload(Trip.days).joinedload(TripDay.schedules))
        .filter(Trip.id == trip_id)
        .first()
    )
    if trip is None:
        raise HTTPException(status_code=404, detail="여행 일정을 찾을 수 없습니다")
    if not _is_accessible(db, trip, user_id):
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
    return trip


# ── 참여자 관리 ──────────────────────────────────────────────

def get_participants(db: Session, user_id: int, trip_id: int) -> list[ParticipantResponse]:
    logger.info(f"참여자 목록 조회 - user_id: {user_id}, trip_id: {trip_id}")
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="여행 일정을 찾을 수 없습니다")
    if not _is_accessible(db, trip, user_id):
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다")

    rows = (
        db.query(TripParticipant, User)
        .join(User, TripParticipant.user_id == User.id)
        .filter(TripParticipant.trip_id == trip_id)
        .all()
    )
    result = [
        ParticipantResponse(
            user_id=u.id, email=u.email, address=u.address, is_owner=False
        )
        for _, u in rows
    ]
    owner = db.query(User).filter(User.id == trip.user_id).first()
    result.insert(0, ParticipantResponse(
        user_id=owner.id, email=owner.email, address=owner.address, is_owner=True
    ))
    return result


def add_participant(db: Session, owner_id: int, trip_id: int, email: str) -> ParticipantResponse:
    logger.info(f"참여자 추가 - owner_id: {owner_id}, trip_id: {trip_id}, email: {email}")
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == owner_id).first()
    if trip is None:
        raise HTTPException(status_code=403, detail="일정 소유자만 참여자를 추가할 수 있습니다")

    target = db.query(User).filter(User.email == email).first()
    if target is None:
        raise HTTPException(status_code=404, detail="해당 이메일의 사용자를 찾을 수 없습니다")
    if target.id == owner_id:
        raise HTTPException(status_code=400, detail="본인은 추가할 수 없습니다")

    exists = db.query(TripParticipant).filter(
        TripParticipant.trip_id == trip_id,
        TripParticipant.user_id == target.id,
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="이미 참여 중인 사용자입니다")

    db.add(TripParticipant(trip_id=trip_id, user_id=target.id))
    db.commit()
    return ParticipantResponse(user_id=target.id, email=target.email, address=target.address, is_owner=False)


def remove_participant(db: Session, owner_id: int, trip_id: int, target_user_id: int):
    logger.info(f"참여자 제거 - owner_id: {owner_id}, trip_id: {trip_id}, target: {target_user_id}")
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == owner_id).first()
    if trip is None:
        raise HTTPException(status_code=403, detail="일정 소유자만 참여자를 제거할 수 있습니다")

    row = db.query(TripParticipant).filter(
        TripParticipant.trip_id == trip_id,
        TripParticipant.user_id == target_user_id,
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="해당 참여자를 찾을 수 없습니다")

    db.delete(row)
    db.commit()


# ── 커뮤니티 / 리뷰 ─────────────────────────────────────────

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
