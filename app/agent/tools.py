TRAVEL_TOOLS = [
    {
        "name": "get_spots_by_area",
        "description": "지역명으로 관광지 목록을 조회합니다. 특정 지역의 관광지, 음식점, 숙박 등 전체 목록이 필요할 때 사용하세요.",
        "input_schema": {
            "type": "object",
            "properties": {
                "area_name": {
                    "type": "string",
                    "description": "지역명. 가능한 값: 서울, 인천, 대전, 대구, 광주, 부산, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주"
                },
                "content_type": {
                    "type": "string",
                    "description": "관광지 유형. 가능한 값: 관광지, 문화시설, 축제행사, 레포츠, 숙박, 쇼핑, 음식점",
                    "enum": ["관광지", "문화시설", "축제행사", "레포츠", "숙박", "쇼핑", "음식점"]
                },
                "num_of_rows": {
                    "type": "integer",
                    "description": "조회할 개수. 기본값 50"
                }
            },
            "required": ["area_name"]
        }
    },
    {
        "name": "search_spots_by_keyword",
        "description": "키워드로 관광지를 검색합니다. 특정 장소 이름, 음식 종류, 테마 등 구체적인 검색어가 있을 때 사용하세요.",
        "input_schema": {
            "type": "object",
            "properties": {
                "keyword": {
                    "type": "string",
                    "description": "검색 키워드 (예: 한라산, 흑돼지, 카페, 해수욕장)"
                },
                "area_name": {
                    "type": "string",
                    "description": "지역 필터 (선택). 특정 지역 내에서만 검색할 때 사용"
                },
                "num_of_rows": {
                    "type": "integer",
                    "description": "조회할 개수. 기본값 10"
                }
            },
            "required": ["keyword"]
        }
    },
    {
        "name": "get_spot_detail",
        "description": "관광지의 상세 정보를 조회합니다. 운영시간, 입장료, 휴무일 등 구체적인 정보가 필요할 때 사용하세요.",
        "input_schema": {
            "type": "object",
            "properties": {
                "content_id": {
                    "type": "string",
                    "description": "관광지 고유 ID. get_spots_by_area 또는 search_spots_by_keyword 결과의 contentid 값"
                },
                "content_type_id": {
                    "type": "string",
                    "description": "콘텐츠 타입 ID. 관광지=12, 문화시설=14, 축제행사=15, 레포츠=28, 숙박=32, 쇼핑=38, 음식점=39"
                }
            },
            "required": ["content_id", "content_type_id"]
        }
    },
    {
        "name": "get_spots_by_category",
        "description": "카테고리 분류 코드로 관광지를 조회합니다. 대분류 카테고리 기준으로 필터링할 때 사용하세요.",
        "input_schema": {
            "type": "object",
            "properties": {
                "area_name": {
                    "type": "string",
                    "description": "지역명. 가능한 값: 서울, 인천, 대전, 대구, 광주, 부산, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주"
                },
                "lclsSystm1": {
                    "type": "string",
                    "description": "대분류 카테고리 코드 (예: FD - 음식점, AT - 관광지, AC - 숙박)"
                },
                "num_of_rows": {
                    "type": "integer",
                    "description": "조회할 개수. 기본값 50"
                }
            },
            "required": ["area_name", "lclsSystm1"]
        }
    },
]