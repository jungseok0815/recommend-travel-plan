import httpx
from app.common.core.config import KAKAO_MOBILITY_API_KEY

HEADERS = {"Authorization": f"KakaoAK {KAKAO_MOBILITY_API_KEY}"}


def _get_coordinate(place_name: str) -> tuple[float, float] | None:
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    response = httpx.get(url, headers=HEADERS, params={"query": place_name}, timeout=10)
    response.raise_for_status()
    documents = response.json().get("documents", [])
    if not documents:
        return None
    return float(documents[0]["x"]), float(documents[0]["y"])


def get_travel_time(origin: str, destination: str) -> dict:
    origin_coords      = _get_coordinate(origin)
    destination_coords = _get_coordinate(destination)

    if not origin_coords or not destination_coords:
        return {"error": "좌표를 찾을 수 없습니다"}

    url = "https://apis-navi.kakaomobility.com/v1/directions"
    params = {
        "origin"      : f"{origin_coords[0]},{origin_coords[1]}",
        "destination" : f"{destination_coords[0]},{destination_coords[1]}",
    }
    response = httpx.get(url, headers=HEADERS, params=params, timeout=10)
    response.raise_for_status()

    routes = response.json().get("routes", [])
    if not routes:
        return {"error": "경로를 찾을 수 없습니다"}

    summary = routes[0].get("summary", {})
    return {
        "origin"           : origin,
        "destination"      : destination,
        "duration_minutes" : round(summary.get("duration", 0) / 60),
        "distance_km"      : round(summary.get("distance", 0) / 1000, 1),
    }
