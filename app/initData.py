from sqlalchemy.orm import Session
from app.domain.user.models.userModel import User  # relationship 해석에 필요
from app.domain.trip.models.tripModel import Trip, TripDay, TripSchedule
from app.domain.preference.models.preferenceOptionModel import PreferenceCategory, PreferenceOption

PREFERENCE_CATEGORIES = [
    {
        "key": "travel_style",
        "title": "여행 스타일",
        "subtitle": "선호하는 여행 스타일을 선택하세요 (중복 가능)",
        "multi_select": True,
        "sort_order": 1,
        "options": [
            {"value": "힐링",    "label": "힐링",    "icon": "leaf-outline",       "description": "조용하고 여유로운 힐링 여행", "sort_order": 1},
            {"value": "액티비티", "label": "액티비티", "icon": "bicycle-outline",    "description": "활동적인 스포츠·레저 중심", "sort_order": 2},
            {"value": "관광",    "label": "관광",    "icon": "camera-outline",      "description": "명소·유적지 탐방 위주",      "sort_order": 3},
            {"value": "맛집",    "label": "맛집",    "icon": "restaurant-outline",  "description": "현지 음식·맛집 탐방 중심",  "sort_order": 4},
        ],
    },
    {
        "key": "environment",
        "title": "선호 환경",
        "subtitle": "어떤 환경을 선호하시나요?",
        "multi_select": False,
        "sort_order": 2,
        "options": [
            {"value": "자연", "label": "자연", "icon": "trail-sign-outline", "description": "산·바다·숲 등 자연 속 여행", "sort_order": 1},
            {"value": "도심", "label": "도심", "icon": "business-outline",   "description": "도시·번화가 중심 여행",      "sort_order": 2},
        ],
    },
    {
        "key": "accommodation",
        "title": "숙박 유형",
        "subtitle": "선호하는 숙박 형태를 선택하세요 (중복 가능)",
        "multi_select": True,
        "sort_order": 3,
        "options": [
            {"value": "호텔",       "label": "호텔",       "icon": "bed-outline",      "description": "편리한 호텔·리조트",         "sort_order": 1},
            {"value": "펜션",       "label": "펜션",       "icon": "home-outline",     "description": "아늑한 펜션·풀빌라",         "sort_order": 2},
            {"value": "게스트하우스", "label": "게스트하우스", "icon": "people-outline",   "description": "저렴하고 소통하는 게스트하우스", "sort_order": 3},
            {"value": "캠핑",       "label": "캠핑",       "icon": "bonfire-outline",  "description": "자연 속 캠핑·글램핑",        "sort_order": 4},
        ],
    },
    {
        "key": "interest",
        "title": "관심사",
        "subtitle": "여행에서 중요하게 생각하는 것을 선택하세요 (중복 가능)",
        "multi_select": True,
        "sort_order": 4,
        "options": [
            {"value": "사진",     "label": "사진",     "icon": "image-outline",    "description": "인생샷·감성 사진 촬영",   "sort_order": 1},
            {"value": "역사",     "label": "역사",     "icon": "library-outline",  "description": "역사·문화 유적지 탐방",   "sort_order": 2},
            {"value": "카페",     "label": "카페",     "icon": "cafe-outline",     "description": "분위기 있는 카페 투어",   "sort_order": 3},
            {"value": "쇼핑",     "label": "쇼핑",     "icon": "bag-outline",      "description": "쇼핑·기념품 구매",       "sort_order": 4},
            {"value": "로컬 문화", "label": "로컬 문화", "icon": "earth-outline",    "description": "현지 문화·축제 체험",    "sort_order": 5},
        ],
    },
    {
        "key": "travel_frequency",
        "title": "여행 빈도",
        "subtitle": "평균적으로 얼마나 자주 여행하시나요?",
        "multi_select": False,
        "sort_order": 5,
        "options": [
            {"value": "월 1회",   "label": "월 1회",   "icon": "calendar-outline", "description": "한 달에 한 번 이상",  "sort_order": 1},
            {"value": "분기 1회", "label": "분기 1회", "icon": "calendar-outline", "description": "3개월에 한 번 정도", "sort_order": 2},
            {"value": "연 1~2회", "label": "연 1~2회", "icon": "calendar-outline", "description": "1년에 한두 번",      "sort_order": 3},
        ],
    },
]

# 내 여행 데이터 (user_id=2 소유)
MY_TRIPS = [
    {
        "destination": "제주도",
        "transport": "대중교통",
        "start_datetime": "2025-07-10",
        "end_datetime": "2025-07-13",
        "group_size": 2,
        "budget": 800000,
        "total_cost": None,
        "status": "계획 중",
        "days": [
            {"day": 1, "date": "2025-07-10", "schedules": [
                {"time": "10:00", "activity": "제주공항 도착", "location": "제주국제공항", "cost": 0},
                {"time": "12:00", "activity": "점심 - 흑돼지 구이", "location": "제주시 연동", "cost": 25000},
                {"time": "14:00", "activity": "용두암 관광", "location": "용두암", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 해산물", "location": "제주항 근처", "cost": 35000},
            ]},
            {"day": 2, "date": "2025-07-11", "schedules": [
                {"time": "09:00", "activity": "한라산 어리목 코스 등반", "location": "한라산 국립공원", "cost": 0},
                {"time": "14:00", "activity": "협재해수욕장", "location": "협재해수욕장", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 갈치조림", "location": "제주시", "cost": 20000},
            ]},
            {"day": 3, "date": "2025-07-12", "schedules": [
                {"time": "10:00", "activity": "성산일출봉 등반", "location": "성산일출봉", "cost": 5000},
                {"time": "13:00", "activity": "점심 - 전복죽", "location": "성산읍", "cost": 15000},
                {"time": "15:00", "activity": "섭지코지 산책", "location": "섭지코지", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 돔베고기", "location": "서귀포", "cost": 22000},
            ]},
            {"day": 4, "date": "2025-07-13", "schedules": [
                {"time": "10:00", "activity": "면세점 쇼핑", "location": "제주공항 면세점", "cost": 50000},
                {"time": "13:00", "activity": "공항 출발", "location": "제주국제공항", "cost": 0},
            ]},
        ],
    },
    {
        "destination": "부산",
        "transport": "자동차",
        "start_datetime": "2025-06-05",
        "end_datetime": "2025-06-07",
        "group_size": 4,
        "budget": 600000,
        "total_cost": None,
        "status": "계획 중",
        "days": [
            {"day": 1, "date": "2025-06-05", "schedules": [
                {"time": "11:00", "activity": "해운대 해수욕장 도착", "location": "해운대 해수욕장", "cost": 0},
                {"time": "13:00", "activity": "점심 - 밀면", "location": "해운대 밀면 골목", "cost": 9000},
                {"time": "15:00", "activity": "동백섬 산책", "location": "동백섬", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 씨푸드", "location": "해운대", "cost": 45000},
            ]},
            {"day": 2, "date": "2025-06-06", "schedules": [
                {"time": "10:00", "activity": "광안리 해수욕장", "location": "광안리", "cost": 0},
                {"time": "12:00", "activity": "점심 - 돼지국밥", "location": "광안리", "cost": 10000},
                {"time": "18:00", "activity": "광안대교 야경", "location": "광안리", "cost": 0},
                {"time": "19:30", "activity": "저녁 - 조개구이", "location": "민락수변공원", "cost": 35000},
            ]},
            {"day": 3, "date": "2025-06-07", "schedules": [
                {"time": "09:00", "activity": "자갈치 시장", "location": "자갈치 시장", "cost": 0},
                {"time": "11:00", "activity": "국제시장 쇼핑", "location": "국제시장", "cost": 30000},
                {"time": "13:00", "activity": "점심 - 비빔밥", "location": "남포동", "cost": 12000},
                {"time": "15:00", "activity": "귀가 출발", "location": "부산", "cost": 0},
            ]},
        ],
    },
    {
        "destination": "경주",
        "transport": "기타",
        "start_datetime": "2025-02-14",
        "end_datetime": "2025-02-16",
        "group_size": 2,
        "budget": 400000,
        "total_cost": 370000,
        "status": "완료",
        "days": [
            {"day": 1, "date": "2025-02-14", "schedules": [
                {"time": "11:00", "activity": "경주역 도착", "location": "경주역", "cost": 0},
                {"time": "12:00", "activity": "점심 - 쌈밥정식", "location": "경주 시내", "cost": 13000},
                {"time": "14:00", "activity": "불국사 관람", "location": "불국사", "cost": 6000},
                {"time": "17:00", "activity": "석굴암 방문", "location": "석굴암", "cost": 6000},
                {"time": "19:00", "activity": "저녁 - 한정식", "location": "황리단길", "cost": 28000},
            ]},
            {"day": 2, "date": "2025-02-15", "schedules": [
                {"time": "09:00", "activity": "첨성대 & 동궁과 월지", "location": "첨성대", "cost": 3000},
                {"time": "12:00", "activity": "점심 - 교리 김밥", "location": "교리김밥", "cost": 6000},
                {"time": "14:00", "activity": "대릉원 관람", "location": "대릉원", "cost": 3000},
                {"time": "16:00", "activity": "황리단길 카페 투어", "location": "황리단길", "cost": 15000},
            ]},
            {"day": 3, "date": "2025-02-16", "schedules": [
                {"time": "09:00", "activity": "양동마을 방문", "location": "양동마을", "cost": 4000},
                {"time": "12:00", "activity": "점심 - 순두부 백반", "location": "경주", "cost": 9000},
                {"time": "14:00", "activity": "경주역 출발", "location": "경주역", "cost": 0},
            ]},
        ],
    },
    {
        "destination": "강릉",
        "transport": "자동차",
        "start_datetime": "2025-01-03",
        "end_datetime": "2025-01-05",
        "group_size": 3,
        "budget": 500000,
        "total_cost": 460000,
        "status": "완료",
        "days": [
            {"day": 1, "date": "2025-01-03", "schedules": [
                {"time": "10:00", "activity": "안목 해변 커피거리", "location": "안목해변", "cost": 5000},
                {"time": "12:00", "activity": "점심 - 초당순두부", "location": "초당동", "cost": 10000},
                {"time": "14:00", "activity": "경포대 & 경포해수욕장", "location": "경포대", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 물회", "location": "강릉 시내", "cost": 18000},
            ]},
            {"day": 2, "date": "2025-01-04", "schedules": [
                {"time": "09:00", "activity": "오죽헌 관람", "location": "오죽헌", "cost": 3000},
                {"time": "11:00", "activity": "강릉 중앙시장 구경", "location": "중앙시장", "cost": 10000},
                {"time": "13:00", "activity": "점심 - 곰치국", "location": "강릉 시내", "cost": 14000},
                {"time": "15:00", "activity": "정동진 해돋이 전망대", "location": "정동진", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 닭갈비", "location": "강릉", "cost": 16000},
            ]},
            {"day": 3, "date": "2025-01-05", "schedules": [
                {"time": "09:00", "activity": "주문진 수산시장", "location": "주문진", "cost": 20000},
                {"time": "12:00", "activity": "점심 - 해물라면", "location": "주문진", "cost": 8000},
                {"time": "14:00", "activity": "귀가 출발", "location": "강릉", "cost": 0},
            ]},
        ],
    },
]

# 커뮤니티 여행 데이터 (user_id=1 소유 → 탐색 화면에서 표시)
COMMUNITY_TRIPS = [
    {
        "destination": "제주시",
        "transport": "대중교통",
        "start_datetime": "2025-04-10",
        "end_datetime": "2025-04-13",
        "group_size": 2,
        "budget": 800000,
        "total_cost": 720000,
        "status": "완료",
        "days": [
            {"day": 1, "date": "2025-04-10", "schedules": [
                {"time": "10:00", "activity": "제주공항 도착 후 렌터카 수령", "location": "제주국제공항", "cost": 0},
                {"time": "12:00", "activity": "점심 - 흑돼지 구이", "location": "제주시 연동", "cost": 25000},
                {"time": "14:00", "activity": "용두암 관광", "location": "용두암", "cost": 0},
                {"time": "18:00", "activity": "저녁 - 해산물 뷔페", "location": "제주항 근처", "cost": 35000},
            ]},
            {"day": 2, "date": "2025-04-11", "schedules": [
                {"time": "09:00", "activity": "한라산 어리목 코스 등반", "location": "한라산 국립공원", "cost": 0},
                {"time": "14:00", "activity": "점심 - 산 정상 도시락", "location": "한라산", "cost": 8000},
                {"time": "17:00", "activity": "협재해수욕장 방문", "location": "협재해수욕장", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 갈치조림", "location": "제주시", "cost": 20000},
            ]},
            {"day": 3, "date": "2025-04-12", "schedules": [
                {"time": "10:00", "activity": "성산일출봉 등반", "location": "성산일출봉", "cost": 5000},
                {"time": "13:00", "activity": "점심 - 전복죽", "location": "성산읍", "cost": 15000},
                {"time": "15:00", "activity": "섭지코지 산책", "location": "섭지코지", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 돔베고기", "location": "서귀포", "cost": 22000},
            ]},
            {"day": 4, "date": "2025-04-13", "schedules": [
                {"time": "10:00", "activity": "면세점 쇼핑", "location": "제주공항 면세점", "cost": 50000},
                {"time": "13:00", "activity": "공항 출발", "location": "제주국제공항", "cost": 0},
            ]},
        ],
    },
    {
        "destination": "해운대",
        "transport": "자동차",
        "start_datetime": "2025-03-22",
        "end_datetime": "2025-03-24",
        "group_size": 4,
        "budget": 600000,
        "total_cost": 580000,
        "status": "완료",
        "days": [
            {"day": 1, "date": "2025-03-22", "schedules": [
                {"time": "11:00", "activity": "해운대 해수욕장 도착", "location": "해운대 해수욕장", "cost": 0},
                {"time": "13:00", "activity": "점심 - 밀면", "location": "해운대 밀면 골목", "cost": 9000},
                {"time": "15:00", "activity": "동백섬 산책", "location": "동백섬", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 씨푸드 레스토랑", "location": "해운대", "cost": 45000},
            ]},
            {"day": 2, "date": "2025-03-23", "schedules": [
                {"time": "10:00", "activity": "광안리 해수욕장", "location": "광안리", "cost": 0},
                {"time": "12:00", "activity": "점심 - 돼지국밥", "location": "광안리", "cost": 10000},
                {"time": "14:00", "activity": "부산 영화의 전당", "location": "해운대", "cost": 0},
                {"time": "18:00", "activity": "광안대교 야경 감상", "location": "광안리", "cost": 0},
                {"time": "19:30", "activity": "저녁 - 조개구이", "location": "민락수변공원", "cost": 35000},
            ]},
            {"day": 3, "date": "2025-03-24", "schedules": [
                {"time": "09:00", "activity": "자갈치 시장 구경", "location": "자갈치 시장", "cost": 0},
                {"time": "11:00", "activity": "국제시장 쇼핑", "location": "국제시장", "cost": 30000},
                {"time": "13:00", "activity": "점심 - 비빔밥", "location": "남포동", "cost": 12000},
                {"time": "15:00", "activity": "귀가 출발", "location": "부산", "cost": 0},
            ]},
        ],
    },
    {
        "destination": "여수",
        "transport": "대중교통",
        "start_datetime": "2024-12-28",
        "end_datetime": "2024-12-30",
        "group_size": 2,
        "budget": 350000,
        "total_cost": 320000,
        "status": "완료",
        "days": [
            {"day": 1, "date": "2024-12-28", "schedules": [
                {"time": "12:00", "activity": "여수엑스포역 도착", "location": "여수엑스포역", "cost": 0},
                {"time": "13:00", "activity": "점심 - 게장백반", "location": "여수 시내", "cost": 15000},
                {"time": "15:00", "activity": "오동도 관람", "location": "오동도", "cost": 0},
                {"time": "19:00", "activity": "여수 밤바다 낭만포차", "location": "낭만포차", "cost": 30000},
            ]},
            {"day": 2, "date": "2024-12-29", "schedules": [
                {"time": "09:00", "activity": "돌산도 & 향일암 일출", "location": "향일암", "cost": 2000},
                {"time": "12:00", "activity": "점심 - 갓김치 정식", "location": "돌산도", "cost": 12000},
                {"time": "14:00", "activity": "이순신광장 & 거북선", "location": "이순신광장", "cost": 0},
                {"time": "16:00", "activity": "여수 케이블카", "location": "여수 해상케이블카", "cost": 15000},
                {"time": "19:00", "activity": "저녁 - 서대회무침", "location": "여수", "cost": 20000},
            ]},
            {"day": 3, "date": "2024-12-30", "schedules": [
                {"time": "10:00", "activity": "예술랜드 관람", "location": "예술랜드", "cost": 8000},
                {"time": "12:00", "activity": "점심 - 꼬막비빔밥", "location": "여수 시내", "cost": 13000},
                {"time": "14:00", "activity": "여수엑스포역 출발", "location": "여수엑스포역", "cost": 0},
            ]},
        ],
    },
    {
        "destination": "전주",
        "transport": "대중교통",
        "start_datetime": "2025-05-01",
        "end_datetime": "2025-05-03",
        "group_size": 2,
        "budget": 300000,
        "total_cost": 280000,
        "status": "완료",
        "days": [
            {"day": 1, "date": "2025-05-01", "schedules": [
                {"time": "11:00", "activity": "전주역 도착", "location": "전주역", "cost": 0},
                {"time": "12:00", "activity": "점심 - 전주비빔밥", "location": "한옥마을 인근", "cost": 12000},
                {"time": "14:00", "activity": "전주한옥마을 산책", "location": "전주한옥마을", "cost": 0},
                {"time": "16:00", "activity": "경기전 관람", "location": "경기전", "cost": 3000},
                {"time": "19:00", "activity": "저녁 - 콩나물국밥", "location": "전주 시내", "cost": 8000},
            ]},
            {"day": 2, "date": "2025-05-02", "schedules": [
                {"time": "09:00", "activity": "전동성당 방문", "location": "전동성당", "cost": 0},
                {"time": "11:00", "activity": "남부시장 야시장 구경", "location": "남부시장", "cost": 15000},
                {"time": "13:00", "activity": "점심 - 피순대", "location": "전주 남부시장", "cost": 7000},
                {"time": "15:00", "activity": "덕진공원 산책", "location": "덕진공원", "cost": 0},
                {"time": "19:00", "activity": "저녁 - 전주 막걸리 골목", "location": "삼천동", "cost": 20000},
            ]},
            {"day": 3, "date": "2025-05-03", "schedules": [
                {"time": "09:00", "activity": "전주 한옥마을 카페 투어", "location": "한옥마을", "cost": 10000},
                {"time": "11:00", "activity": "기념품 쇼핑", "location": "한옥마을 상점", "cost": 20000},
                {"time": "13:00", "activity": "전주역 출발", "location": "전주역", "cost": 0},
            ]},
        ],
    },
]


def _insert_trips(db: Session, trips_data: list, user_id: int):
    for t in trips_data:
        trip = Trip(
            user_id        = user_id,
            destination    = t["destination"],
            transport      = t["transport"],
            start_datetime = t["start_datetime"],
            end_datetime   = t["end_datetime"],
            group_size     = t["group_size"],
            budget         = t["budget"],
            total_cost     = t["total_cost"],
            status         = t["status"],
        )
        db.add(trip)
        db.flush()

        for d in t["days"]:
            day_cost = sum(s["cost"] for s in d["schedules"])
            day = TripDay(
                trip_id  = trip.id,
                day      = d["day"],
                date     = d["date"],
                day_cost = day_cost,
            )
            db.add(day)
            db.flush()

            for s in d["schedules"]:
                db.add(TripSchedule(
                    trip_day_id = day.id,
                    time        = s["time"],
                    activity    = s["activity"],
                    location    = s["location"],
                    cost        = s["cost"],
                ))


def _insert_preference_categories(db: Session):
    for c in PREFERENCE_CATEGORIES:
        category = PreferenceCategory(
            key          = c["key"],
            title        = c["title"],
            subtitle     = c["subtitle"],
            multi_select = c["multi_select"],
            sort_order   = c["sort_order"],
        )
        db.add(category)
        db.flush()

        for o in c["options"]:
            db.add(PreferenceOption(
                category_id = category.id,
                value       = o["value"],
                label       = o["label"],
                icon        = o["icon"],
                description = o["description"],
                sort_order  = o["sort_order"],
            ))


def seed_init_data(db: Session):
    if not db.query(PreferenceCategory).first():
        _insert_preference_categories(db)
        db.commit()

    if not db.query(Trip).first():
        _insert_trips(db, MY_TRIPS, user_id=2)
        _insert_trips(db, COMMUNITY_TRIPS, user_id=1)
        db.commit()
