import logging
import httpx
from app.common.core.config import TOUR_API_KEY
from app.common.api.traffic_api.bus_api_constants import BASE_URL, SCHEDULE_PATH, TerminalId

logger = logging.getLogger(__name__)

COMMON_PARAMS = {
    "serviceKey": TOUR_API_KEY,
    "_type":      "json",
}


def _get(path: str, params: dict) -> dict:
    url = f"{BASE_URL}/{path}"
    merged = {**COMMON_PARAMS, **params}
    response = httpx.get(url, params=merged, timeout=10)
    response.raise_for_status()
    return response.json()


def get_bus_routes(dep_terminal_name: str, arr_terminal_name: str, date: str) -> list[dict]:
    """
    date 형식: YYYYMMDD (예: 20250501)
    """
    dep_id = getattr(TerminalId, dep_terminal_name, None)
    arr_id = getattr(TerminalId, arr_terminal_name, None)

    if not dep_id or not arr_id:
        logger.warning(f"알 수 없는 터미널명: {dep_terminal_name} -> {arr_terminal_name}")
        return []

    data = _get(SCHEDULE_PATH, {
        "depTerminalId": dep_id,
        "arrTerminalId": arr_id,
        "depPlandTime":  date,
        "numOfRows":     20,
        "pageNo":        1,
    })
    items = data.get("response", {}).get("body", {}).get("items", {})
    if not items:
        return []
    return items.get("item", [])
