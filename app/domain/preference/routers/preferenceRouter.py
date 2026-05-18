import logging
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.domain.preference.schema.preferenceSchema import PreferenceCreate, PreferenceResponse
from app.domain.preference.services.preferenceService import create_preference, get_preference, update_preference

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/preference")


@router.post("", response_model=PreferenceResponse)
def create(request: Request, preference_data: PreferenceCreate, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"POST /preference - user_id: {user_id}")
    return create_preference(db, int(user_id), preference_data)


@router.get("", response_model=PreferenceResponse)
def get(request: Request, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"GET /preference - user_id: {user_id}")
    return get_preference(db, int(user_id))


@router.put("", response_model=PreferenceResponse)
def update(request: Request, preference_data: PreferenceCreate, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"PUT /preference - user_id: {user_id}")
    return update_preference(db, int(user_id), preference_data)
