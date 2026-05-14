from sqlalchemy.orm import Session
from app.domain.user.models.userModel import User  # relationship 해석에 필요
from app.domain.trip.models.tripModel import Trip, TripDay, TripSchedule

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


def seed_init_data(db: Session):
    # 이미 데이터가 있으면 skip
    if db.query(Trip).first():
        return

    _insert_trips(db, MY_TRIPS, user_id=2)
    _insert_trips(db, COMMUNITY_TRIPS, user_id=1)
    db.commit()
