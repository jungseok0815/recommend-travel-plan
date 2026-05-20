from pydantic import BaseModel, field_validator
from typing import List


class TravelPriorityItem(BaseModel):
    category: str
    rank: int


class PreferenceCreate(BaseModel):
    travel_priority:    List[TravelPriorityItem]
    food_types:         List[str]
    accommodation_type: List[str]


class PreferenceResponse(BaseModel):
    id:                 int
    user_id:            int
    travel_priority:    List[TravelPriorityItem]
    food_types:         List[str]
    accommodation_type: List[str]

    @field_validator('travel_priority', mode='before')
    @classmethod
    def parse_travel_priority(cls, v):
        if isinstance(v, str):
            return [{"category": c.strip(), "rank": i + 1} for i, c in enumerate(v.split(',')) if c.strip()]
        return v or []

    @field_validator('food_types', 'accommodation_type', mode='before')
    @classmethod
    def parse_csv(cls, v):
        if isinstance(v, str):
            return [x.strip() for x in v.split(',') if x.strip()]
        return v or []

    model_config = {"from_attributes": True}
