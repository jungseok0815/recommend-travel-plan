from pydantic import BaseModel
from enum import Enum


class Transport(str, Enum):
    car    = "자동차"
    public = "대중교통"
    other  = "기타"


class TripCreate(BaseModel):
    destination        : str
    transport          : Transport
    start_datetime     : str
    end_datetime       : str
    group_size         : int
    budget             : int
    participant_emails : list[str] = []


class TripScheduleResponse(BaseModel):
    id               : int
    time             : str
    activity         : str
    location         : str
    transport        : str | None = None
    duration         : str | None = None
    cost             : int
    remaining_budget : int | None = None
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
    id               : int
    user_id          : int
    destination      : str
    transport        : str
    start_datetime   : str
    end_datetime     : str
    group_size       : int
    budget           : int
    total_cost       : int | None = None
    remaining_budget : int | None = None
    status           : str = '계획 중'
    days             : list[TripDayResponse] = []

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
    status         : str = '계획 중'
    user_email     : str
    days           : list[TripDayResponse] = []


class AddParticipantRequest(BaseModel):
    email: str


class ParticipantResponse(BaseModel):
    user_id  : int
    email    : str
    address  : str | None = None
    is_owner : bool = False


class TripStatusUpdate(BaseModel):
    status: str


class TripScheduleUpdate(BaseModel):
    time     : str | None = None
    activity : str | None = None
    location : str | None = None
    cost     : int | None = None
    note     : str | None = None


class TripReviewCreate(BaseModel):
    rating  : int
    content : str


class TripReviewResponse(BaseModel):
    id         : int
    trip_id    : int
    user_id    : int
    rating     : int
    content    : str
    created_at : str
    updated_at : str

    model_config = {"from_attributes": True}
