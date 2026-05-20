import json
import pathlib

_CAT_LABEL_PATH = pathlib.Path(__file__).parent.parent.parent / "resources" / "cat_label.json"
_cat_label_data = json.loads(_CAT_LABEL_PATH.read_text(encoding="utf-8"))
CAT_LABEL: dict[str, str] = {k: v for group in _cat_label_data.values() for k, v in group.items()}


def codes_to_labels(csv: str) -> list[str]:
    return [CAT_LABEL.get(c.strip(), c.strip()) for c in (csv or "").split(",") if c.strip()]


def travel_preference_to_dict(preference) -> list[dict]:
    priority = [p.strip() for p in (preference.travel_priority or "").split(",") if p.strip()]
    return [{"category": CAT_LABEL.get(cat, cat), "rank": rank} for rank, cat in enumerate(priority, 1)]


def food_preference_to_text(preference) -> str:
    return " ".join(codes_to_labels(preference.food_types or ""))


def accommodation_preference_to_text(preference) -> str:
    return " ".join(codes_to_labels(preference.accommodation_type or ""))
