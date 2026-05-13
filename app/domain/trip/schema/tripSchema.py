from pydantic import BaseModel
from enum import Enum

class Transport(str, Enum):
    car    = "자동차"
    public = "대중교통"
    other  = "기타"


class TripCreate(BaseModel):
    destination    : str
    transport      : Transport
    start_datetime : str
    end_datetime   : str
    group_size     : int
    budget         : int


class TripResponse(BaseModel):
    id             : int
    user_id        : int
    destination    : str
    transport      : str
    start_datetime : str
    end_datetime   : str
    group_size     : int
    budget         : int
    itinerary      : str

    model_config = {"from_attributes": True}


class CommunityTripResponse(BaseModel):
    id             : int
    destination    : str
    transport      : str
    start_datetime : str
    end_datetime   : str
    group_size     : int
    budget         : int
    total_cost     : int | None
    user_email     : str
