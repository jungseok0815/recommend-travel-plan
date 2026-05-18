import logging
from app.api.embedding.embedding import json_to_embedding, cosine_similarity
from app.domain.preference.models.userEmbeddingModel import UserEmbedding
from app.domain.preference.models.preferenceModel import Preference

logger = logging.getLogger(__name__)

RANK_WEIGHTS = [1.0, 0.7, 0.4, 0.2]


def _rank_weight_map(travel_priority: str) -> dict[str, float]:
    priority = [p.strip() for p in (travel_priority or "").split(",") if p.strip()]
    return {cat: RANK_WEIGHTS[i] for i, cat in enumerate(priority) if i < len(RANK_WEIGHTS)}


def score_spot(spot: dict, user_vec: list[float], weight_map: dict[str, float]) -> float:
    cat1 = spot.get("cat1", "")
    rank_weight = weight_map.get(cat1, 0.1)

    spot_vec = json_to_embedding(spot.get("embedding") or "")
    if user_vec and spot_vec:
        sim = cosine_similarity(user_vec, spot_vec)
    else:
        sim = 1.0 if cat1 in weight_map else 0.3

    return sim * rank_weight


def filter_travel_spots(spots: list[dict], preference: Preference, user_embedding: UserEmbedding, top_n: int = 30) -> list[dict]:
    weight_map = _rank_weight_map(preference.travel_priority)
    user_vec = json_to_embedding(user_embedding.travel_embedding or "")

    scored = []
    for spot in spots:
        s = score_spot(spot, user_vec, weight_map)
        scored.append({**spot, "_score": round(s, 4)})

    scored.sort(key=lambda x: x["_score"], reverse=True)
    logger.info(f"[필터] 여행지 {len(spots)}개 → 상위 {top_n}개 선별")
    return scored[:top_n]


def filter_food_spots(spots: list[dict], user_embedding: UserEmbedding, top_n: int = 20) -> list[dict]:
    user_vec = json_to_embedding(user_embedding.food_embedding or "")

    scored = []
    for spot in spots:
        spot_vec = json_to_embedding(spot.get("embedding") or "")
        sim = cosine_similarity(user_vec, spot_vec) if user_vec and spot_vec else 0.5
        scored.append({**spot, "_score": round(sim, 4)})

    scored.sort(key=lambda x: x["_score"], reverse=True)
    logger.info(f"[필터] 음식점 {len(spots)}개 → 상위 {top_n}개 선별")
    return scored[:top_n]


def filter_accommodations(spots: list[dict], user_embedding: UserEmbedding, top_n: int = 10) -> list[dict]:
    user_vec = json_to_embedding(user_embedding.accommodation_embedding or "")

    scored = []
    for spot in spots:
        spot_vec = json_to_embedding(spot.get("embedding") or "")
        sim = cosine_similarity(user_vec, spot_vec) if user_vec and spot_vec else 0.5
        scored.append({**spot, "_score": round(sim, 4)})

    scored.sort(key=lambda x: x["_score"], reverse=True)
    logger.info(f"[필터] 숙박 {len(spots)}개 → 상위 {top_n}개 선별")
    return scored[:top_n]
