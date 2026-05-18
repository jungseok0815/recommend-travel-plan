import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.domain.preference.models.preferenceModel import Preference
from app.domain.preference.schema.preferenceSchema import PreferenceCreate, PreferenceResponse
from app.api.embedding.embedding import preference_to_text, get_embedding, embedding_to_json

logger = logging.getLogger(__name__)


def _to_csv(lst: list) -> str:
    return ','.join(lst) if lst else ''


def _build_embedding(preference: Preference) -> str:
    text   = preference_to_text(preference)
    vector = get_embedding(text)
    logger.info(f"[임베딩] 생성 완료 - user_id: {preference.user_id}, text: {text}")
    return embedding_to_json(vector) if vector else None


def create_preference(db: Session, user_id: int, data: PreferenceCreate) -> PreferenceResponse:
    logger.info(f"취향 프로필 생성 - user_id: {user_id}")

    if db.query(Preference).filter(Preference.user_id == user_id).first():
        raise HTTPException(status_code=400, detail="이미 취향 프로필이 존재합니다")

    preference = Preference(
        user_id            = user_id,
        travel_priority    = _to_csv(data.travel_priority),
        sub_A01            = _to_csv(data.sub_A01),
        sub_A02            = _to_csv(data.sub_A02),
        sub_A03            = _to_csv(data.sub_A03),
        sub_A04            = _to_csv(data.sub_A04),
        food_types         = _to_csv(data.food_types),
        accommodation_type = _to_csv(data.accommodation_type),
    )
    db.add(preference)
    db.flush()
    preference.embedding = _build_embedding(preference)
    db.commit()
    db.refresh(preference)
    return preference


def get_preference(db: Session, user_id: int) -> PreferenceResponse:
    logger.info(f"취향 프로필 조회 - user_id: {user_id}")

    preference = db.query(Preference).filter(Preference.user_id == user_id).first()
    if preference is None:
        raise HTTPException(status_code=404, detail="취향 프로필이 없습니다")
    return preference


def update_preference(db: Session, user_id: int, data: PreferenceCreate) -> PreferenceResponse:
    logger.info(f"취향 프로필 수정 - user_id: {user_id}")

    preference = db.query(Preference).filter(Preference.user_id == user_id).first()
    if preference is None:
        raise HTTPException(status_code=404, detail="취향 프로필이 없습니다")

    preference.travel_priority    = _to_csv(data.travel_priority)
    preference.sub_A01            = _to_csv(data.sub_A01)
    preference.sub_A02            = _to_csv(data.sub_A02)
    preference.sub_A03            = _to_csv(data.sub_A03)
    preference.sub_A04            = _to_csv(data.sub_A04)
    preference.food_types         = _to_csv(data.food_types)
    preference.accommodation_type = _to_csv(data.accommodation_type)
    preference.embedding          = _build_embedding(preference)

    db.commit()
    db.refresh(preference)
    return preference
