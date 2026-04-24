from fastapi import FastAPI
from app.domain.recommend.services.recommend import get_travel_recommend

app = FastAPI()

@app.get("/travel/recommend")
def