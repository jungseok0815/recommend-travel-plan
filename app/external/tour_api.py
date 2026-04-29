import logging
import httpx
from app.core.config import TOUR_API_KEY

BaseUrl = "https://apis.data.go.kr/B551011/KorService1"

COMMON_PARAMS = {
    "serviceKey" : TOUR_API_KEY,
    "MobileOS"   : "ETC",
    "MobileApp"  : "RecommendTravelPlan",
    "_type"      : "json",
}

CONTENT_TYPE = {
    "관광지"  : "12",
    "문화시설": "14",
    "축제행사": "15",
    "레포츠"  : "28",
    "숙박"    : "32",
    "쇼핑"    : "38",
    "음식점"  : "39",
}

AREA_CODE = {
    "서울": "1",  "인천": "2",  "대전": "3",
    "대구": "4",  "광주": "5",  "부산": "6",
    "울산": "7",  "세종": "8",  "경기": "31",
    "강원": "32", "충북": "33", "충남": "34",
    "전북": "35", "전남": "36", "경북": "37",
    "경남": "38", "제주": "39",
}


def _get(endpoint: str, params: dict) -> dict:
    url = f"{BaseUrl}/{endpoint}"
    merged = {**COMMON_PARAMS, **params}
    response = httpx.get(url, params=merged, timeout=10)
    response.raise_for_status()
    return response.json()



def get_spots_by_area(area_name: str, content_type: str ="관광지", num_of_row: int = 50) -> list[dict]:
    logging.info("get_spots_by_area")
    area_code = AREA_CODE.get(area_name)
    if not area_code :
        logging.info(f"알 수 없는 지역명: {area_name}")
        return []
    
    data = _get("areaBasedList1",{
        "areacode" : area_code,
        "contentTypeId" : CONTENT_TYPE.get(content_type, "12"),
        "numOfRows"     : num_of_row,
        "pageNo"        : 1,
    })

    items = data.get("response", {}).get("body", {}).get("items", {})
    
    if not items:
        return []

    return items.get("item",[])    
    

    
    