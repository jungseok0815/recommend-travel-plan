from app.domain.trip.planner.external.kakao_api.kakao_api import get_travel_time

def test_get_travel_time():
  result = get_travel_time("오봉산마을1단지", "전주 한옥마을")

  print("\n=== 이동시간 조회 결과 ===")
  print(result)

  assert "duration_minutes" in result
  assert "distance_km" in result