import logging
import pathlib
import pandas as pd
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.domain.trip.planner.external.tour_api.tour_api import get_spots_by_area
from app.domain.trip.planner.external.tour_api.tour_api_constants import AreaCode

logger = logging.getLogger(__name__)

EXCEL_DIR = pathlib.Path("data/travel")


def collect_all_areas():
    """AreaCode에 정의된 모든 지역 데이터를 엑셀로 저장"""
    EXCEL_DIR.mkdir(parents=True, exist_ok=True)
    areas = {name: code for name, code in vars(AreaCode).items() if not name.startswith("_")}

    for area_name in areas:
        try:
            logger.info(f"[스케줄러] 데이터 수집 시작 - {area_name}")
            attractions    = get_spots_by_area(area_name, content_type="관광지",  num_of_rows=50)
            restaurants    = get_spots_by_area(area_name, content_type="음식점",  num_of_rows=30)
            accommodations = get_spots_by_area(area_name, content_type="숙박",    num_of_rows=20)

            excel_path = EXCEL_DIR / f"{area_name}.xlsx"
            with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
                pd.DataFrame(attractions).to_excel(writer,    sheet_name="관광지", index=False)
                pd.DataFrame(restaurants).to_excel(writer,    sheet_name="음식점", index=False)
                pd.DataFrame(accommodations).to_excel(writer, sheet_name="숙박",   index=False)

            logger.info(f"[스케줄러] 저장 완료 - {excel_path}")
        except Exception as e:
            logger.error(f"[스케줄러] {area_name} 수집 실패 - {e}")


def start_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        collect_all_areas,
        trigger=CronTrigger(hour=2, minute=0),
        id="collect_travel_data",
        name="여행 데이터 수집 (새벽 2시)",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("[스케줄러] 시작 - 매일 새벽 2시에 여행 데이터 수집")
    return scheduler
