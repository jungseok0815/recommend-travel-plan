import logging
import httpx
from app.core.config import TOUR_API_KEY
from app.external.tour_api.tour_api_constants import BASE_URL, Endpoint, ContentType, AreaCode

logger = logging.getLogger(__name__)

COMMON_PARAMS = {
    "serviceKey" : TOUR_API_KEY,
    "MobileOS"   : "ETC",
    "MobileApp"  : "RecommendTravelPlan",
    "_type"      : "json",
}


def _get(endpoint: str, params: dict) -> dict:
    url = f"{BASE_URL}/{endpoint}"
    merged = {**COMMON_PARAMS, **params}
    response = httpx.get(url, params=merged, timeout=10)
    response.raise_for_status()
    return response.json()


def get_spots_by_area(area_name: str, content_type: str = "관광지", num_of_rows: int = 50) -> list[dict]:
    area_code = getattr(AreaCode, area_name, None)
    if not area_code:
        logger.warning(f"알 수 없는 지역명: {area_name}")
        return []

    data = _get(Endpoint.AREA_BASED_LIST, {
        "areaCode"      : area_code,
        "contentTypeId" : getattr(ContentType, content_type, ContentType.관광지),
        "numOfRows"     : num_of_rows,
        "pageNo"        : 1,
    })

    items = data.get("response", {}).get("body", {}).get("items", {})
    if not items:
        return []
    return items.get("item", [])


def search_spots_by_keyword(keyword: str, area_name: str | None = None, num_of_rows: int = 10) -> list[dict]:
    params = {
        "keyword"   : keyword,
        "numOfRows" : num_of_rows,
        "pageNo"    : 1,
    }

    if area_name:
        area_code = getattr(AreaCode, area_name, None)
        if area_code:
            params["areaCode"] = area_code

    data = _get(Endpoint.SEARCH_KEYWORD, params)

    items = data.get("response", {}).get("body", {}).get("items", {})
    if not items:
        return []
    return items.get("item", [])


def get_spot_detail(content_id: str, content_type_id: str) -> dict:
    data = _get(Endpoint.DETAIL_INTRO, {
        "contentId"     : content_id,
        "contentTypeId" : content_type_id,
    })

    items = data.get("response", {}).get("body", {}).get("items", {})
    if not items:
        return {}
    item_list = items.get("item", [])
    return item_list[0] if item_list else {}

def get_spots_by_category(area_name: str, lclsSystm1: str, num_of_rows: int = 50) -> list[dict]:
    arae_code  = getattr(AreaCode, area_name, None)
    if not arae_code:
        logger.warning(f"알수없는 지역명:{area_name}")
    
    params = {
        "areaCode" : arae_code,
        "lclsSystm1" : lclsSystm1,
        "numOfRows" : num_of_rows,
        "pageNo" : 1,
    }
    data = _get(Endpoint.AREA_BASED_LIST, params)
    items = data.get("response", {}).get("body", {}).get("items", {})
    if not items:
        return {}
    item_list = items.get("item", [])
    return item_list[0] if item_list else {}
