from app.planner.pipeline.travel_planner import plan_travel


def test_plan_travel():
    result = plan_travel(area_name="서울", days=2)

    print("\n=== 생성된 여행 일정 ===")
    import json
    print(json.dumps(result, ensure_ascii=False, indent=2))

    assert isinstance(result, dict), "결과가 dict여야 합니다"
