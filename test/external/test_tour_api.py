from app.external.tour_api import get_spots_by_area

def test_get_spots_by_area():
    result = get_spots_by_area("제주")
    print(result)
    assert len(result) > 0

test_get_spots_by_area()