BASE_URL = "https://apis.data.go.kr/B551011/KorService2"


class Endpoint:
    AREA_BASED_LIST = "areaBasedList2"  # 지역 기반 관광정보 목록 조회
    SEARCH_KEYWORD  = "searchKeyword2"  # 키워드로 관광정보 검색
    DETAIL_COMMON   = "detailCommon2"   # 관광지 상세 공통정보 조회 (주소, 이미지, 좌표 등)
    DETAIL_INTRO    = "detailIntro2"    # 콘텐츠 타입별 소개정보 조회 (운영시간, 입장료, 휴무일 등)
    DETAIL_IMAGE    = "detailImage2"    # 관광지 이미지 목록 조회
    AREA_CODE       = "areaCode2"       # 지역코드 목록 조회


class ContentType:
    관광지  = "12"
    문화시설 = "14"
    축제행사 = "15"
    레포츠  = "28"
    숙박    = "32"
    쇼핑    = "38"
    음식점  = "39"


class AreaCode:
    서울 = "1";  인천 = "2";  대전 = "3"
    대구 = "4";  광주 = "5";  부산 = "6"
    울산 = "7";  세종 = "8";  경기 = "31"
    강원 = "32"; 충북 = "33"; 충남 = "34"
    전북 = "35"; 전남 = "36"; 경북 = "37"
    경남 = "38"; 제주 = "39"
