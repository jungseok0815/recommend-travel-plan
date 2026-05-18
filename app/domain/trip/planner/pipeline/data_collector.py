import logging
import pathlib
import pandas as pd
from app.domain.trip.planner.external.tour_api.tour_api import get_spots_by_area

logger = logging.getLogger(__name__)

EXCEL_DIR = pathlib.Path("data/travel")


def collect_travel_data(area_name: str) -> dict:
    excel_path = EXCEL_DIR / f"{area_name}.xlsx"

    content_types = ["관광지", "문화시설", "축제행사", "레포츠", "숙박", "쇼핑", "음식점"]

    if excel_path.exists():
        logger.info(f"[데이터] 엑셀 파일 사용 - {excel_path}")
        return {
            content_type: pd.read_excel(excel_path, sheet_name=content_type).to_dict("records")
            for content_type in content_types
        }

    logger.warning(f"[데이터] 엑셀 없음, API 직접 호출 - {area_name}")
    return {
        content_type: get_spots_by_area(area_name, content_type=content_type, num_of_rows=50)
        for content_type in content_types
    }
