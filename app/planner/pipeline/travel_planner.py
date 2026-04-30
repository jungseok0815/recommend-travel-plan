import json
# import anthropic
# from app.core.config import ANTHROPIC_API_KEY
from google import genai
from app.core.config import GEMINI_API_KEY
from app.planner.pipeline.data_collector import collect_travel_data
from app.planner.pipeline.prompt_builder import build_prompt

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

def plan_travel(area_name: str, startDate: str, endDate : str, address:str) -> dict:
    # 1. 데이터 수집
    data = collect_travel_data(area_name)

    # 2. 프롬프트 생성
    prompt = build_prompt(area_name, startDate, endDate, address, data)

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

    cleaned = final_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(cleaned)