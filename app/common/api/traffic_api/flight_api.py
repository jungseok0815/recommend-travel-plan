import logging
import httpx
from app.common.core.config import TOUR_API_KEY
from app.common.api.traffic_api.flight_api_constants import BASE_URL, SCHEDULE_ENDPOINT, AirportCode

logger = logging.getLogger(__name__)


def _get(params: dict) -> dict:
    url = f"{BASE_URL}{SCHEDULE_ENDPOINT}"
    merged = {"serviceKey": TOUR_API_KEY, "returnType": "JSON", **params}
    response = httpx.get(url, params=merged, timeout=10)
    response.raise_for_status()
    return response.json()


def get_flight_schedules(dep_airport_name: str, arr_airport_name: str, date: str) -> list[dict]:
    """
    date 형식: YYYYMMDD (예: 20250501)
    """
    dep_code = getattr(AirportCode, dep_airport_name, None)
    arr_code = getattr(AirportCode, arr_airport_name, None)

    if not dep_code or not arr_code:
        logger.warning(f"알 수 없는 공항명: {dep_airport_name} -> {arr_airport_name}")
        return []

    data = _get({"page": 1, "perPage": 100})
    items = data.get("data", [])
    if not items:
        return []

    return [
        item for item in items
        if item.get("출발공항코드") == dep_code
        and item.get("도착공항코드") == arr_code
        and str(item.get("출발일자", "")).replace("-", "") == date
    ]
