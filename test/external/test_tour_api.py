from app.external.tour_api import get_spots_by_area,get_spot_detail,search_spots_by_keyword
## test 실행방법 
## pytest test/external/test_tour_api.py -v -s

def test_get_spots_by_area():
    result = get_spots_by_area("제주")
    print(result)
    assert len(result) > 0

# test_get_spots_by_area()

def test_search_spots_by_keyword():
    keyword = "카페"
    area_name="제주"

    result = search_spots_by_keyword(keyword, area_name)
    print(result)
    assert len(result) > 0

test_search_spots_by_keyword()

def test_get_spot_detail():
    contentId = 600584
    contentTypeId = 12
    result = get_spot_detail(contentId, contentTypeId)
    print(result)
    assert len(result) > 0

# test_get_spot_detail()





