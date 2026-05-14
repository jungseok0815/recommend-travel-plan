import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.domain.preference.models.preferenceModel import Preference
from app.domain.preference.models.preferenceOptionModel import PreferenceCategory
from app.domain.preference.schema.preferenceSchema import PreferenceCreate, PreferenceResponse

logger = logging.getLogger(__name__)


def create_preference(db: Session, user_id: int, preference_data: PreferenceCreate) -> PreferenceResponse:
    logger.info(f"취향 프로필 생성 - user_id: {user_id}")

    existing = db.query(Preference).filter(Preference.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 취향 프로필이 존재합니다")

    preference = Preference(
        user_id          = user_id,
        travel_style     = ','.join(preference_data.travel_style),
        environment      = preference_data.environment,
        accommodation    = ','.join(preference_data.accommodation),
        interest         = ','.join(preference_data.interest),
        travel_frequency = preference_data.travel_frequency,
    )
    db.add(preference)
    db.commit()
    db.refresh(preference)
    return preference


def get_preference(db: Session, user_id: int) -> PreferenceResponse:
    logger.info(f"취향 프로필 조회 - user_id: {user_id}")

    preference = db.query(Preference).filter(Preference.user_id == user_id).first()
    if preference is None:
        raise HTTPException(status_code=404, detail="취향 프로필이 없습니다")

    return preference


def update_preference(db: Session, user_id: int, preference_data: PreferenceCreate) -> PreferenceResponse:
    logger.info(f"취향 프로필 수정 - user_id: {user_id}")

    preference = db.query(Preference).filter(Preference.user_id == user_id).first()
    if preference is None:
        raise HTTPException(status_code=404, detail="취향 프로필이 없습니다")

    preference.travel_style     = ','.join(preference_data.travel_style)
    preference.environment      = preference_data.environment
    preference.accommodation    = ','.join(preference_data.accommodation)
    preference.interest         = ','.join(preference_data.interest)
    preference.travel_frequency = preference_data.travel_frequency

    db.commit()
    db.refresh(preference)
    return preference


def get_preference_options(db: Session):
    logger.info("취향 선택지 조회")
    return (
        db.query(PreferenceCategory)
        .order_by(PreferenceCategory.sort_order)
        .all()
    )
