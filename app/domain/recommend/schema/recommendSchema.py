from pydantic import BaseModel


class RecommendRequest(BaseModel):
    trip_id : int


class RecommendResponse(BaseModel):
    trip_id   : int
    itinerary : str

    model_config = {"from_attributes": True}
