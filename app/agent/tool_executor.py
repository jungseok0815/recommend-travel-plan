import json 
from app.external.tour_api.tour_api import get_spots_by_area, search_spots_by_keyword,get_spot_detail,get_spots_by_category

def execute_tool(tool_name: str, tool_input: dict):
    try:
        if tool_name == "get_spots_by_area":
            result = get_spots_by_area(**tool_input)
        elif tool_name == "search_spots_by_keyword":
            result = search_spots_by_keyword(**tool_input)
        elif tool_name == "get_spot_detail":
            result = get_spot_detail(**tool_input)
        elif tool_name == "get_spots_by_category":
            result = get_spots_by_category(**tool_input)
        else:
            result = {"error": f"알 수 없는 tool: {tool_name}"}  # 추가
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)

    
