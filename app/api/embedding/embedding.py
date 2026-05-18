import json
import logging
import numpy as np
from google import genai
from app.core.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

client = genai.Client(api_key=GEMINI_API_KEY)

# cat 코드 → 한국어 레이블 매핑
CAT_LABEL = {
    # cat1
    "A01": "자연", "A02": "인문", "A03": "레포츠", "A04": "쇼핑",
    # 자연 세부
    "A01010500": "해수욕장 해변", "A01010100": "산 트레킹",
    "A01010800": "계곡 래프팅",   "A01011500": "온천 스파",
    "A01011200": "공원 수목원",
    # 인문 세부
    "A0201": "역사 유적 고궁", "A0203": "전통문화 체험",
    "A0202": "테마파크",       "A0205": "전망대 랜드마크",
    # 레포츠 세부
    "A0302": "육상 레포츠 트레킹 자전거", "A0303": "수상 레포츠 서핑 카약",
    "A0304": "항공 레포츠 패러글라이딩",  "A0305": "복합 레포츠",
    # 숙박
    "B02010100": "호텔", "B02010900": "펜션", "B02011400": "게스트하우스",
    "B02011700": "캠핑", "B02011300": "한옥", "B02011600": "리조트",
    # 음식
    "korean": "한식", "western": "양식", "japanese": "일식",
    "cafe":   "카페", "market":  "전통시장 먹거리", "buffet": "뷔페",
    # 쇼핑 세부
    "market_shop": "전통시장", "mall": "쇼핑몰 백화점",
    "outlet":      "아울렛",   "dutyfree": "면세점",
}


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
        result = client.models.embed_content(
            model="text-embedding-004",
            contents=text,
        )
        return result.embeddings[0].values
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
