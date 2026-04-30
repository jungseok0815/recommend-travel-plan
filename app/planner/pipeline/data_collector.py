from app.planner.external.tour_api.tour_api import get_spots_by_area


def collect_travel_data(area_name: str) -> dict:
    attractions    = get_spots_by_area(area_name, content_type="관광지", num_of_rows=20)
    restaurants    = get_spots_by_area(area_name, content_type="음식점", num_of_rows=20)
    accommodations = get_spots_by_area(area_name, content_type="숙박",  num_of_rows=10)
    return {
        "attractions":    attractions,
        "restaurants":    restaurants,
        "accommodations": accommodations,
    }
