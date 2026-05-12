import json
import anthropic
from app.core.config import ANTHROPIC_API_KEY
from app.domain.trip.planner.agent.tools import TRAVEL_TOOLS
from app.domain.trip.planner.agent.tool_executor import execute_tool

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

DEFAULT_SYSTEM_PROMPT = """
    You are an expert on travel itineraries in Korea.
    Please collect tourist destination information and create an optimal itinerary to meet your request.
    Be sure to respond in JSON format only.
"""

def plan_travel(user_request: str)-> dict:
    messages = [{"role": "user", "content": user_request}]

    max_iterations = 30
    count = 0

    while count < max_iterations:
        count += 1
        response = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=4096,
            system=DEFAULT_SYSTEM_PROMPT,
            tools=TRAVEL_TOOLS,
            messages=messages
        )

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
            messages.append({"role": "user", "content": tool_results})

        elif response.stop_reason == "end_turn":
            final_text = next(b.text for b in response.content if b.type == "text")
            cleaned = final_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(cleaned)

    return {"error": "최대 반복 횟수를 초과했습니다."}
