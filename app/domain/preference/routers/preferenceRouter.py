import logging
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.domain.preference.schema.preferenceSchema import PreferenceCreate, PreferenceResponse
from app.domain.preference.services.preferenceService import create_preference, get_preference, update_preference, get_preference_or_none

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/preference")


@router.post("", response_model=PreferenceResponse)
def create(request: Request, preference_data: PreferenceCreate, db: Session = Depends(get_db)):
    user_id = request.state.user_id
    logger.info(f"POST /preference - user_id: {user_id}")
    if get_preference_or_none(db, int(user_id)):
        raise HTTPException(status_code=400, detail="이미 취향 프로필이 존재합니다")
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
