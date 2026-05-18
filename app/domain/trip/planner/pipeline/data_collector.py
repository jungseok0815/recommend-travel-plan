import logging
import pathlib
import pandas as pd
from app.domain.trip.planner.external.tour_api.tour_api import get_spots_by_area

logger = logging.getLogger(__name__)

EXCEL_DIR = pathlib.Path("data/travel")


def collect_travel_data(area_name: str) -> dict:
    excel_path = EXCEL_DIR / f"{area_name}.xlsx"

    if excel_path.exists():
        logger.info(f"[데이터] 엑셀 파일 사용 - {excel_path}")
        return {
            "attractions":    pd.read_excel(excel_path, sheet_name="관광지").to_dict("records"),
            "restaurants":    pd.read_excel(excel_path, sheet_name="음식점").to_dict("records"),
            "accommodations": pd.read_excel(excel_path, sheet_name="숙박").to_dict("records"),
        }

    logger.warning(f"[데이터] 엑셀 없음, API 직접 호출 - {area_name}")
    return {
        "attractions":    get_spots_by_area(area_name, content_type="관광지",  num_of_rows=50),
        "restaurants":    get_spots_by_area(area_name, content_type="음식점",  num_of_rows=30),
        "accommodations": get_spots_by_area(area_name, content_type="숙박",    num_of_rows=20),
    }
