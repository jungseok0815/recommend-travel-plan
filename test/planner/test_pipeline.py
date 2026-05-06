import json
from app.planner.pipeline.travel_planner import plan_travel


def test_plan_travel():
    result = plan_travel(
        area_name="전주",
        startDate="2025-05-01",
        endDate="2025-05-03",
        address="오봉산마을1단지",
        transport_mode="자동차",
    )

    print("\n=== 생성된 여행 일정 ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))

    assert isinstance(result, dict), "결과가 dict여야 합니다"
