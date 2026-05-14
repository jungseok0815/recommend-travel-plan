from pydantic import BaseModel, field_validator
from typing import List
from enum import Enum


class TravelStyle(str, Enum):
    healing  = "힐링"
    activity = "액티비티"
    tour     = "관광"
    food     = "맛집"

class Environment(str, Enum):
    nature = "자연"
    city   = "도심"

class Accommodation(str, Enum):
    hotel      = "호텔"
    pension    = "펜션"
    guesthouse = "게스트하우스"
    camping    = "캠핑"

class Interest(str, Enum):
    photo    = "사진"
    history  = "역사"
    cafe     = "카페"
    shopping = "쇼핑"
    local    = "로컬 문화"

class TravelFrequency(str, Enum):
    monthly   = "월 1회"
    quarterly = "분기 1회"
    yearly    = "연 1~2회"


class PreferenceCreate(BaseModel):
    travel_style:     List[TravelStyle]
    environment:      Environment
    accommodation:    List[Accommodation]
    interest:         List[Interest]
    travel_frequency: TravelFrequency


class PreferenceResponse(BaseModel):
    id:               int
    user_id:          int
    travel_style:     List[str]
    environment:      str
    accommodation:    List[str]
    interest:         List[str]
    travel_frequency: str

    @field_validator('travel_style', 'accommodation', 'interest', mode='before')
    @classmethod
    def parse_csv(cls, v):
        if isinstance(v, str):
            return [x.strip() for x in v.split(',') if x.strip()]
        return v

    model_config = {"from_attributes": True}


class PreferenceOptionResponse(BaseModel):
    value:       str
    label:       str
    icon:        str
    description: str

    model_config = {"from_attributes": True}


class PreferenceCategoryResponse(BaseModel):
    key:          str
    title:        str
    subtitle:     str
    multi_select: bool
    options:      List[PreferenceOptionResponse]

    model_config = {"from_attributes": True}
