import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.domain.preference.models.preferenceModel import Preference
from app.domain.preference.models.userEmbeddingModel import UserEmbedding
from app.domain.preference.schema.preferenceSchema import PreferenceCreate, PreferenceResponse
from app.utils.category.category import (
    travel_preference_to_dict,
    food_preference_to_text,
    accommodation_preference_to_text,
)
from app.utils.embedding.embedding import get_embedding, embedding_to_json
from app.domain.preference.services.preferenceFilter import _rank_weight_map

logger = logging.getLogger(__name__)

#취향 프로필 조회
def get_preference(db: Session, user_id: int) -> PreferenceResponse:
    logger.info(f"취향 프로필 조회 - user_id: {user_id}")

    preference = db.query(Preference).filter(Preference.user_id == user_id).first()
    if preference is None:
        raise HTTPException(status_code=404, detail="취향 프로필이 없습니다")
    return preference

#사용자 취향 프로필 여부 조회
def get_preference_or_none(db: Session, user_id: int):
    return db.query(Preference).filter(Preference.user_id == user_id).first()

#사용자 취향 프로필 등록 및 백터 생성
def create_preference(db: Session, user_id: int, data: PreferenceCreate) -> PreferenceResponse:
    logger.info(f"취향 프로필 생성 - user_id: {user_id}")

    preference = Preference(user_id=user_id)
    for field, value in data.model_dump().items():
        if field == 'travel_priority':
            setattr(preference, field, _priority_to_csv(value))
        else:
            setattr(preference, field, _to_csv(value))
    db.add(preference)
    db.flush()

    _upsert_embeddings(db, preference)

    db.commit()
    db.refresh(preference)
    return preference

#사용자 취향 프로필 수정 맟 백터 수정
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

#취향 백터 생성
def _upsert_embeddings(db: Session, preference: Preference) -> None:
    #1.관광코드에 맞는 용어 조회
    travel_items = travel_preference_to_dict(preference)
    food_text   = food_preference_to_text(preference)
    acc_text    = accommodation_preference_to_text(preference)
    
    #2.백터화 진행
    travel_vec = _rank_weight_map(travel_items)
    food_vec   = get_embedding(food_text)
    acc_vec    = get_embedding(acc_text)

    logger.info(f"travel_vec : {travel_vec}")
    logger.info(f"food_vec : {food_vec}")
    logger.info(f"acc_vec : {acc_vec}")
    #3
    record = db.query(UserEmbedding).filter(UserEmbedding.user_id == preference.user_id).first()
    if record is None:
        record = UserEmbedding(user_id=preference.user_id)
        db.add(record)

    record.travel_embedding        = embedding_to_json(travel_vec) if travel_vec else None
    record.food_embedding          = embedding_to_json(food_vec)   if food_vec   else None
    record.accommodation_embedding = embedding_to_json(acc_vec)    if acc_vec    else None

    logger.info(f"[임베딩] 저장 완료 - user_id: {preference.user_id}")

def _to_csv(lst: list) -> str:
    return ','.join(lst) if lst else ''


def _priority_to_csv(items: list) -> str:
    sorted_items = sorted(items, key=lambda x: x['rank'])
    return ','.join(item['category'] for item in sorted_items)