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
    


def start_scheduler() -> BackgroundScheduler:
