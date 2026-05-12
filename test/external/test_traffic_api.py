import httpx
from app.core.config import TOUR_API_KEY
from app.domain.trip.planner.external.traffic_api.flight_api import get_flight_schedules
from app.domain.trip.planner.external.traffic_api.bus_api import get_bus_routes
from app.domain.trip.planner.external.traffic_api.bus_api_constants import BASE_URL, SCHEDULE_PATH

## test 실행방법
## venv\Scripts\pytest test/external/test_traffic_api.py -v -s


def test_get_flight_schedules():
    result = get_flight_schedules(
        dep_airport_name="서울_김포",
        arr_airport_name="제주",
        date="20250501",
    )
    print(result)
    assert isinstance(result, list)


def test_bus_raw_response():
    """API 응답 구조 확인용 - 파라미터 없이 호출"""
    url = f"{BASE_URL}/{SCHEDULE_PATH}"
    response = httpx.get(url, params={
        "serviceKey": TOUR_API_KEY,
        "_type":      "json",
        "numOfRows":  3,
        "pageNo":     1,
    }, timeout=10)
    print("\n=== 버스 API raw 응답 ===")
    print(response.text)
    assert response.status_code == 200


def test_get_bus_routes():
    result = get_bus_routes(
        dep_terminal_name="서울경부",
        arr_terminal_name="부산",
        date="20250530",
    )
    print(result)
    assert isinstance(result, list)
