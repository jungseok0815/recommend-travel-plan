from app.utils.embedding import CAT_LABEL, get_embedding, cosine_similarity, embedding_to_json, json_to_embedding
from app.utils.embedding import CAT_LABEL as _CAT_LABEL
import pathlib
import json
import logging

logger = logging.getLogger(__name__)

_CAT_LABEL_PATH = pathlib.Path(__file__).parent / "cat_label.json"
_cat_label_data = json.loads(_CAT_LABEL_PATH.read_text(encoding="utf-8"))


def _codes_to_labels(csv: str) -> list[str]:
    return [CAT_LABEL.get(c.strip(), c.strip()) for c in (csv or "").split(",") if c.strip()]


def travel_preference_to_text(preference) -> str:
    parts = []
    priority = [p.strip() for p in (preference.travel_priority or "").split(",") if p.strip()]
    for rank, cat in enumerate(priority, 1):
        parts.append(f"{rank}순위 {CAT_LABEL.get(cat, cat)}")
    for field in ["sub_A01", "sub_A02", "sub_A03", "sub_A04"]:
        parts.extend(_codes_to_labels(getattr(preference, field) or ""))
    return " ".join(parts)


def food_preference_to_text(preference) -> str:
    return " ".join(_codes_to_labels(preference.food_types or ""))


def accommodation_preference_to_text(preference) -> str:
    return " ".join(_codes_to_labels(preference.accommodation_type or ""))
