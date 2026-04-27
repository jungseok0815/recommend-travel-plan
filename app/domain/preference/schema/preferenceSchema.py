from pydantic import BaseModel
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
    photo        = "사진"
    history      = "역사"
    cafe         = "카페"
    shopping     = "쇼핑"
    local        = "로컬 문화"

class TravelFrequency(str, Enum):
    monthly   = "월 1회"
    quarterly = "분기 1회"
    yearly    = "연 1~2회"


class PreferenceCreate(BaseModel):
    travel_style      : TravelStyle
    environment       : Environment
    accommodation     : Accommodation
    interest          : Interest
    travel_frequency  : TravelFrequency

class PreferenceResponse(BaseModel):
    id               : int
    user_id          : int
    travel_style     : str
    environment      : str
    accommodation    : str
    interest         : str
    travel_frequency : str

    model_config = {"from_attributes": True}
