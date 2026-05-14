from sqlalchemy.orm import Session
from app.domain.preference.models.preferenceOptionModel import PreferenceCategory, PreferenceOption

SEED_DATA = [
    {
        "key": "travel_style",
        "title": "여행 스타일이\n어떻게 되시나요?",
        "subtitle": "평소 선호하는 여행 방식을 모두 선택해주세요",
        "multi_select": True,
        "sort_order": 1,
        "options": [
            {"value": "힐링",     "label": "힐링",     "icon": "leaf-outline",       "description": "조용히 쉬고 싶어요",     "sort_order": 1},
            {"value": "액티비티", "label": "액티비티", "icon": "bicycle-outline",    "description": "활동적인 여행을 즐겨요", "sort_order": 2},
            {"value": "관광",     "label": "관광",     "icon": "map-outline",        "description": "명소를 두루 둘러봐요",   "sort_order": 3},
            {"value": "맛집",     "label": "맛집",     "icon": "restaurant-outline", "description": "맛있는 음식이 최고예요", "sort_order": 4},
        ],
    },
    {
        "key": "environment",
        "title": "어떤 환경을\n선호하시나요?",
        "subtitle": "더 즐기는 여행 환경을 선택해주세요",
        "multi_select": False,
        "sort_order": 2,
        "options": [
            {"value": "자연", "label": "자연", "icon": "partly-sunny-outline", "description": "산, 바다, 숲 등 자연 속으로",      "sort_order": 1},
            {"value": "도심", "label": "도심", "icon": "business-outline",     "description": "도시의 활기와 편리함을 선호해요", "sort_order": 2},
        ],
    },
    {
        "key": "accommodation",
        "title": "선호하는 숙소\n유형은 무엇인가요?",
        "subtitle": "편안한 여행을 위한 숙소를 모두 선택해주세요",
        "multi_select": True,
        "sort_order": 3,
        "options": [
            {"value": "호텔",        "label": "호텔",        "icon": "bed-outline",     "description": "편리한 서비스와 시설",    "sort_order": 1},
            {"value": "펜션",        "label": "펜션",        "icon": "home-outline",    "description": "아늑하고 프라이빗한 공간", "sort_order": 2},
            {"value": "게스트하우스", "label": "게스트하우스", "icon": "people-outline",  "description": "여행자들과 교류해요",     "sort_order": 3},
            {"value": "캠핑",        "label": "캠핑",        "icon": "bonfire-outline", "description": "자연 속에서 야외 숙박",   "sort_order": 4},
        ],
    },
    {
        "key": "interest",
        "title": "특별한 관심사가\n있으신가요?",
        "subtitle": "여행에서 즐기는 활동을 모두 선택해주세요",
        "multi_select": True,
        "sort_order": 4,
        "options": [
            {"value": "사진",      "label": "사진",      "icon": "camera-outline",  "description": "인생샷을 남겨요",         "sort_order": 1},
            {"value": "역사",      "label": "역사",      "icon": "library-outline", "description": "역사와 문화를 탐방해요",   "sort_order": 2},
            {"value": "카페",      "label": "카페",      "icon": "cafe-outline",    "description": "분위기 좋은 카페 투어",   "sort_order": 3},
            {"value": "쇼핑",      "label": "쇼핑",      "icon": "bag-outline",     "description": "여행지 쇼핑이 즐거워요",   "sort_order": 4},
            {"value": "로컬 문화", "label": "로컬 문화", "icon": "earth-outline",   "description": "현지 문화를 경험해요",     "sort_order": 5},
        ],
    },
    {
        "key": "travel_frequency",
        "title": "얼마나 자주\n여행을 떠나시나요?",
        "subtitle": "평소 여행 빈도를 알려주세요",
        "multi_select": False,
        "sort_order": 5,
        "options": [
            {"value": "월 1회",   "label": "월 1회",   "icon": "calendar-outline", "description": "매달 여행을 즐겨요",           "sort_order": 1},
            {"value": "분기 1회", "label": "분기 1회", "icon": "time-outline",     "description": "3개월에 한 번 정도",           "sort_order": 2},
            {"value": "연 1~2회", "label": "연 1~2회", "icon": "airplane-outline", "description": "1년에 한두 번 특별하게",       "sort_order": 3},
        ],
    },
]


def seed_preference_options(db: Session):
    if db.query(PreferenceCategory).first():
        return

    for cat_data in SEED_DATA:
        options_data = cat_data.pop("options")
        category = PreferenceCategory(**cat_data)
        db.add(category)
        db.flush()

        for opt_data in options_data:
            db.add(PreferenceOption(category_id=category.id, **opt_data))

        cat_data["options"] = options_data  # restore for idempotency

    db.commit()
