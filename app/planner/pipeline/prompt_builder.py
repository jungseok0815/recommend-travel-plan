import json

def build_prompt(area_name: str, startDate: str, endDate: str, address: str, transport_mode: str, data: dict) -> str:
    return f"""
            여행 조건:
            - 지역: {area_name}
            - 출발장소 : {address}
            - 이동방식 : {transport_mode}
            - 시작일 : {startDate}
            - 종료일 : {endDate}

            관광지 목록:
            {json.dumps(data["attractions"], ensure_ascii=False)}

            음식점 목록:
            {json.dumps(data["restaurants"], ensure_ascii=False)}

            숙박 목록:
            {json.dumps(data["accommodations"], ensure_ascii=False)}

            위 데이터를 바탕으로 최적의 여행 일정을 JSON으로 만들어주세요.
        """


