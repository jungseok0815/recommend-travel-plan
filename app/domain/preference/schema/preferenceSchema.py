from pydantic import BaseModel, field_validator
from typing import List


class PreferenceCreate(BaseModel):
    travel_priority:    List[str]  # ['A01', 'A03', 'A02', 'A04'] 순위 순
    sub_A01:            List[str]
    sub_A02:            List[str]
    sub_A03:            List[str]
    sub_A04:            List[str]
    food_types:         List[str]
    accommodation_type: List[str]


class PreferenceResponse(BaseModel):
    id:                 int
    user_id:            int
    travel_priority:    List[str]
    sub_A01:            List[str]
    sub_A02:            List[str]
    sub_A03:            List[str]
    sub_A04:            List[str]
    food_types:         List[str]
    accommodation_type: List[str]

    @field_validator(
        'travel_priority', 'sub_A01', 'sub_A02', 'sub_A03', 'sub_A04',
        'food_types', 'accommodation_type',
        mode='before',
    )
    @classmethod
    def parse_csv(cls, v):
        if isinstance(v, str):
            return [x.strip() for x in v.split(',') if x.strip()]
        return v or []

    model_config = {"from_attributes": True}
