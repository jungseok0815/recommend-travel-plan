import logging
import numpy as np
from app.utils.embedding.embedding import json_to_embedding, cosine_similarity, get_embedding
from app.domain.preference.models.userEmbeddingModel import UserEmbedding

logger = logging.getLogger(__name__)

RANK_WEIGHTS = [1.0, 0.7, 0.4, 0.2]


def _rank_weight_map(travel_items: list[dict]) -> list[float]:
    sorted_items = sorted(travel_items, key=lambda x: x['rank'])

    weighted_vecs = []
    for item in sorted_items:
        weight = RANK_WEIGHTS[item['rank'] - 1] if item['rank'] - 1 < len(RANK_WEIGHTS) else 0.1
        vec = np.array(get_embedding(item['category']))
        weighted_vecs.append(vec * weight)

    if not weighted_vecs:
        return []

    combined = np.sum(weighted_vecs, axis=0)
    norm = np.linalg.norm(combined)
    return (combined / norm).tolist() if norm > 0 else []


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
