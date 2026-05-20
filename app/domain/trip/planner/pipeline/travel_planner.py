import json
import re
# import anthropic
# from app.common.core.config import ANTHROPIC_API_KEY
from google import genai
from app.common.core.config import GEMINI_API_KEY
from app.domain.trip.planner.pipeline.data_collector import collect_travel_data
from app.domain.trip.planner.pipeline.prompt_builder import build_prompt
from app.domain.preference.services.preferenceFilter import filter_food_spots, filter_accommodations

# Anthropic 클라이언트 (주석 처리)
# client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

client = genai.Client(api_key=GEMINI_API_KEY)

DEFAULT_SYSTEM_PROMPT = """
당신은 한국 여행 일정 전문가입니다.
제공된 데이터를 바탕으로 최적의 여행 일정을 만들어 주세요.
출발시간과 도착시간을 기준으로 여행을 지정해주세요.
즉 이동시간을 계산해서 작성해야 합니다.
타임라인 형식으로 제공해주세요
"""

def plan_travel(area_name: str, startDate: str, endDate: str, address: str, transport_mode: str, user_embedding=None) -> dict:
    # 1. 데이터 수집
    data = collect_travel_data(area_name)

    # 2. 벡터화 정보가 있으면 사용자 취향 기반 필터링
    if user_embedding:
        if data.get("음식점"):
            data["음식점"] = filter_food_spots(data["음식점"], user_embedding)
        if data.get("숙박"):
            data["숙박"] = filter_accommodations(data["숙박"], user_embedding)

    # 3. 프롬프트 생성
    prompt = build_prompt(area_name, startDate, endDate, address, transport_mode, data)

    # Anthropic 단건 호출 (주석 처리)
    # response = client.messages.create(
    #     model="claude-sonnet-4-6",
    #     max_tokens=4096,
    #     system=DEFAULT_SYSTEM_PROMPT,
    #     messages=[{"role": "user", "content": prompt}]
    # )
    # final_text = response.content[0].text

    # 3. Gemini 단건 호출
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=DEFAULT_SYSTEM_PROMPT + "\n" + prompt,
    )
    final_text = response.text

    match = re.search(r"```json\s*(.*?)\s*```", final_text, re.DOTALL)
    cleaned = match.group(1) if match else final_text.strip()
    return json.loads(cleaned)