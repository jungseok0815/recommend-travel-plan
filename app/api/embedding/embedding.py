from app.utils.embedding import CAT_LABEL


def _codes_to_labels(csv: str) -> list[str]:
    return [CAT_LABEL.get(c.strip(), c.strip()) for c in (csv or "").split(",") if c.strip()]


def travel_preference_to_text(preference) -> str:
    parts = []
    priority = [p.strip() for p in (preference.travel_priority or "").split(",") if p.strip()]
    for rank, cat in enumerate(priority, 1):
        parts.append(f"{rank}순위 {CAT_LABEL.get(cat, cat)}")
    return " ".join(parts)


def food_preference_to_text(preference) -> str:
    return " ".join(_codes_to_labels(preference.food_types or ""))


def accommodation_preference_to_text(preference) -> str:
    return " ".join(_codes_to_labels(preference.accommodation_type or ""))
