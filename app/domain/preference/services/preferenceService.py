import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.domain.preference.models.preferenceModel import Preference
from app.domain.preference.models.userEmbeddingModel import UserEmbedding
from app.domain.preference.schema.preferenceSchema import PreferenceCreate, PreferenceResponse
from app.api.embedding.embedding import (
    travel_preference_to_text,
    food_preference_to_text,
    accommodation_preference_to_text,
    get_embedding,
    embedding_to_json,
)

logger = logging.getLogger(__name__)


def _to_csv(lst: list) -> str:
    return ','.join(lst) if lst else ''


def _upsert_embeddings(db: Session, preference: Preference) -> None:
    travel_text = travel_preference_to_text(preference)
    food_text   = food_preference_to_text(preference)
    acc_text    = accommodation_preference_to_text(preference)

    travel_vec = get_embedding(travel_text)
    food_vec   = get_embedding(food_text)
    acc_vec    = get_embedding(acc_text)

    logger.info(f"[임베딩] user_id={preference.user_id}")
    logger.info(f"  travel  text : {travel_text}")
    logger.info(f"  travel  vec  : dim={len(travel_vec)}, sample={travel_vec[:5]}")
    logger.info(f"  food    text : {food_text}")
    logger.info(f"  food    vec  : dim={len(food_vec)}, sample={food_vec[:5]}")
    logger.info(f"  acc     text : {acc_text}")
    logger.info(f"  acc     vec  : dim={len(acc_vec)}, sample={acc_vec[:5]}")

    record = db.query(UserEmbedding).filter(UserEmbedding.user_id == preference.user_id).first()
    if record is None:
        record = UserEmbedding(user_id=preference.user_id)
        db.add(record)

    record.travel_embedding        = embedding_to_json(travel_vec) if travel_vec else None
    record.food_embedding          = embedding_to_json(food_vec)   if food_vec   else None
    record.accommodation_embedding = embedding_to_json(acc_vec)    if acc_vec    else None

    logger.info(f"[임베딩] 저장 완료 - user_id: {preference.user_id}")


def get_preference_or_none(db: Session, user_id: int):
    return db.query(Preference).filter(Preference.user_id == user_id).first()


def create_preference(db: Session, user_id: int, data: PreferenceCreate) -> PreferenceResponse:
    logger.info(f"취향 프로필 생성 - user_id: {user_id}")

    preference = Preference(user_id=user_id)
    for field, value in data.model_dump().items():
        setattr(preference, field, _to_csv(value))
    db.add(preference)
    db.flush()

    _upsert_embeddings(db, preference)

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

    for field, value in data.model_dump().items():
        setattr(preference, field, _to_csv(value))

    _upsert_embeddings(db, preference)

    db.commit()
    db.refresh(preference)
    return preference
