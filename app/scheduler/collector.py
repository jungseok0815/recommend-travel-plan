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
    EXCEL_DIR.mkdir(parents= True, exist_ok=True)
    areas = {name: code for name, code in vars(AreaCode).items() if not name.startswith("_")}

    content_types = ["관광지", "문화시설", "축제행사", "레포츠", "숙박", "쇼핑", "음식점"]

    for area_name in areas:
        try:
            logger.info(f"스케줄러 수집시작 - {area_name}")

            excel_path = EXCEL_DIR / f"{area_name}.xlsx"
            with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
                for content_type in content_types:
                    data = get_spots_by_area(area_name, content_type=content_type, num_of_rows=50)
                    pd.DataFrame(data).to_excel(writer, sheet_name=content_type, index=False)

            logger.info(f"[스케줄러] 저장 완료 - {excel_path}")
        except Exception as e:
            logger.error(f"[스케줄러] {area_name} 수집 실패 - {e}")
            
def start_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        collect_all_areas,
        trigger=CronTrigger(hour=2, minute=0),    # ← 새벽 2시에
        id="collect_travel_data",
        replace_existing=True,
    )
    scheduler.start()
    return scheduler