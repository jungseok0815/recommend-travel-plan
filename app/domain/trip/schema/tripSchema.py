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


class TripScheduleResponse(BaseModel):
    id               : int
    time             : str
    activity         : str
    location         : str
    transport        : str | None = None
    duration         : str | None = None
    cost             : int
    remaining_budget : int
    note             : str | None = None

    model_config = {"from_attributes": True}


class TripDayResponse(BaseModel):
    id       : int
    day      : int
    date     : str
    day_cost : int
    schedules: list[TripScheduleResponse] = []

    model_config = {"from_attributes": True}


class TripResponse(BaseModel):
    id             : int
    user_id        : int
    destination    : str
    transport      : str
    start_datetime : str
    end_datetime   : str
    group_size     : int
    budget         : int
    total_cost     : int | None = None
    remaining_budget: int | None = None
    days           : list[TripDayResponse] = []

    model_config = {"from_attributes": True}


class CommunityTripResponse(BaseModel):
    id             : int
    destination    : str
    transport      : str
    start_datetime : str
    end_datetime   : str
    group_size     : int
    budget         : int
    total_cost     : int | None = None
    user_email     : str
    days           : list[TripDayResponse] = []
