BASE_URL = "https://apis.data.go.kr/1613000/ExpBusInfo"


class Endpoint:
    ROUTE_LIST    = "getStrtpntAlocFndExpbusInfo"  # 출발지/도착지별 노선 조회
    TERMINAL_LIST = "getExpBusTerminalList"         # 터미널 목록 조회


class TerminalCode:
    서울_센트럴 = "NAEK000000"
    동서울      = "NAEK000001"
    부산        = "NAEK000002"
    대구        = "NAEK000003"
    광주        = "NAEK000004"
    대전        = "NAEK000005"
    인천        = "NAEK000006"
    수원        = "NAEK000007"
    강릉        = "NAEK000008"
    전주        = "NAEK000009"
