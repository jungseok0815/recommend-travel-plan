import logging
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.domain.trip.schema.tripSchema import (
    TripCreate, TripResponse, CommunityTripResponse,
    TripReviewCreate, TripReviewResponse,
    AddParticipantRequest, ParticipantResponse,
)
from app.domain.trip.services.tripService import (
    create_trip, get_trip_list, get_trip, get_community_trips,
    create_or_update_review, get_review,
    get_participants, add_participant, remove_participant,
)

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


@router.get("/{trip_id}/participants", response_model=list[ParticipantResponse])
def list_participants(trip_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"GET /trip/{trip_id}/participants - user_id: {user_id}")
    return get_participants(db, int(user_id), trip_id)


@router.post("/{trip_id}/participants", response_model=ParticipantResponse)
def invite_participant(trip_id: int, body: AddParticipantRequest, request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"POST /trip/{trip_id}/participants - owner: {user_id}, email: {body.email}")
    return add_participant(db, int(user_id), trip_id, body.email)


@router.delete("/{trip_id}/participants/{target_user_id}", status_code=204)
def kick_participant(trip_id: int, target_user_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"DELETE /trip/{trip_id}/participants/{target_user_id} - owner: {user_id}")
    remove_participant(db, int(user_id), trip_id, target_user_id)


@router.post("/{trip_id}/review", response_model=TripReviewResponse)
def write_review(trip_id: int, review_data: TripReviewCreate, request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"POST /trip/{trip_id}/review - user_id: {user_id}")
    return create_or_update_review(db, int(user_id), trip_id, review_data)


@router.get("/{trip_id}/review", response_model=TripReviewResponse)
def read_review(trip_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"GET /trip/{trip_id}/review - user_id: {user_id}")
    return get_review(db, int(user_id), trip_id)
