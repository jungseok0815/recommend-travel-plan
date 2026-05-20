import logging
import httpx
from datetime import datetime
from app.common.core.config import WEATHER_API_KEY

logger = logging.getLogger(__name__)

BASE_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"

# 지역명 → 기상청 격자 좌표 (nx, ny)
AREA_GRID = {
    "서울": (60, 127), "인천": (55, 124), "대전": (67, 100),
    "대구": (89, 90),  "광주": (58, 74),  "부산": (98, 76),
    "울산": (102, 84), "세종": (66, 103), "경기": (60, 120),
    "강원": (73, 134), "충북": (69, 107), "충남": (68, 100),
    "전북": (63, 89),  "전남": (51, 67),  "경북": (91, 106),
    "경남": (91, 77),  "제주": (52, 38),
}

# 하늘 상태 코드
SKY_LABEL = {1: "맑음", 3: "구름많음", 4: "흐림"}
# 강수 형태 코드
PTY_LABEL = {0: "", 1: "비", 2: "비/눈", 3: "눈", 4: "소나기"}

# 기상청 발표 시각 목록 (정시 기준)
_BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23]


def _latest_base_time() -> tuple[str, str]:
    """현재 시각 기준 가장 최근 발표 시각 반환 (base_date, base_time)"""
    now = datetime.now()
    hour = max((h for h in _BASE_HOURS if h <= now.hour), default=23)
    # 자정 이전 시간이면 당일, 23시 기준이면 전날일 수 있으나 단순화
    return now.strftime("%Y%m%d"), f"{hour:02d}00"


def get_weather_for_dates(area_name: str, dates: list) -> dict:
    """
    지역명과 날짜 목록을 받아 날짜별 날씨 요약을 반환합니다.

    Args:
        area_name: 지역명 (예: "서울", "제주")
        dates: 날짜 문자열 리스트 (예: ["2026-05-18", "2026-05-19"])

    Returns:
        {
          "2026-05-18": {
            "sky": "맑음",        # 하늘 상태
            "pty": "",            # 강수 형태 (없으면 빈 문자열)
            "temp_min": 18,       # 최저 기온 (°C)
            "temp_max": 28,       # 최고 기온 (°C)
            "pop": 20,            # 최대 강수확률 (%)
          },
          ...
        }
        기상청 예보 범위(약 3일) 밖의 날짜는 결과에 포함되지 않습니다.
    """
    grid = AREA_GRID.get(area_name)
    if not grid:
        logger.warning(f"[날씨] 격자 좌표 없음 - {area_name}")
        return {}

    nx, ny = grid
    base_date, base_time = _latest_base_time()

    try:
        response = httpx.get(BASE_URL, params={
            "serviceKey": WEATHER_API_KEY,
            "pageNo":     1,
            "numOfRows":  1000,
            "dataType":   "JSON",
            "base_date":  base_date,
            "base_time":  base_time,
            "nx":         nx,
            "ny":         ny,
        }, timeout=10)
        response.raise_for_status()
        items = response.json()["response"]["body"]["items"]["item"]
    except Exception as e:
        logger.error(f"[날씨] 기상청 API 호출 실패 - {e}")
        return {}

    # 조회 날짜를 YYYYMMDD → YYYY-MM-DD 역인덱스로 준비
    date_index = {d.replace("-", ""): d for d in dates}

    # 날짜별 버킷 초기화
    bucket: dict[str, dict] = {d: {"temp": [], "sky": [], "pop": [], "pty": []} for d in dates}

    for item in items:
        date_key = date_index.get(item["fcstDate"])
        if not date_key:
            continue
        category = item["category"]
        value    = item["fcstValue"]

        if category == "TMP":    # 시간별 기온
            bucket[date_key]["temp"].append(float(value))
        elif category == "SKY":  # 하늘 상태
            bucket[date_key]["sky"].append(int(value))
        elif category == "POP":  # 강수 확률
            bucket[date_key]["pop"].append(int(value))
        elif category == "PTY":  # 강수 형태
            bucket[date_key]["pty"].append(int(value))

    result = {}
    for date in dates:
        b = bucket[date]
        if not b["temp"]:
            continue  # 예보 범위 밖 날짜는 제외

        # 하늘 상태: 시간대별 최빈값
        sky = max(set(b["sky"]), key=b["sky"].count) if b["sky"] else 1
        # 강수 형태: 비/눈이 한 번이라도 있으면 우선
        pty_values = [v for v in b["pty"] if v != 0]
        pty = pty_values[0] if pty_values else 0

        result[date] = {
            "sky":      SKY_LABEL.get(sky, "맑음"),
            "pty":      PTY_LABEL.get(pty, ""),
            "temp_min": int(min(b["temp"])),
            "temp_max": int(max(b["temp"])),
            "pop":      max(b["pop"]) if b["pop"] else 0,
        }

    logger.info(f"[날씨] {area_name} {len(result)}일치 데이터 조회 완료")
    return result
