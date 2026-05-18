import json
import logging
import pathlib
import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

_model = SentenceTransformer("jhgan/ko-sroberta-multitask")

# cat_label.json 로드 후 단일 평면 딕셔너리로 병합
_CAT_LABEL_PATH = pathlib.Path(__file__).parent / "cat_label.json"
_cat_label_data = json.loads(_CAT_LABEL_PATH.read_text(encoding="utf-8"))
CAT_LABEL: dict[str, str] = {k: v for group in _cat_label_data.values() for k, v in group.items()}


def _codes_to_labels(csv: str) -> list[str]:
    return [CAT_LABEL.get(c.strip(), c.strip()) for c in (csv or "").split(",") if c.strip()]


def travel_preference_to_text(preference) -> str:
    """여행 취향 텍스트 (관광지/레포츠/쇼핑 필터링용)"""
    parts = []
    priority = [p.strip() for p in (preference.travel_priority or "").split(",") if p.strip()]
    for rank, cat in enumerate(priority, 1):
        parts.append(f"{rank}순위 {CAT_LABEL.get(cat, cat)}")
    for field in ["sub_A01", "sub_A02", "sub_A03", "sub_A04"]:
        parts.extend(_codes_to_labels(getattr(preference, field) or ""))
    return " ".join(parts)


def food_preference_to_text(preference) -> str:
    """음식 취향 텍스트 (음식점 필터링용)"""
    return " ".join(_codes_to_labels(preference.food_types or ""))


def accommodation_preference_to_text(preference) -> str:
    """숙박 취향 텍스트 (숙박 필터링용)"""
    return " ".join(_codes_to_labels(preference.accommodation_type or ""))


def get_embedding(text: str) -> list[float]:
    """텍스트 → 768차원 임베딩 벡터"""
    try:
        return _model.encode(text).tolist()
    except Exception as e:
        logger.error(f"[임베딩] 생성 실패 - {e}")
        return []


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """두 벡터의 코사인 유사도 (0.0 ~ 1.0)"""
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


def embedding_to_json(vector: list[float]) -> str:
    return json.dumps(vector)


def json_to_embedding(text: str) -> list[float]:
    return json.loads(text) if text else []
