from fastapi import APIRouter
from app.domain.recommend.services.recommend import get_travel_recommend

router = APIRouter(prefix="/user")

@router.get("/signup")
def signup(user_data: UserCreate,  db: Session = Depends(get_db)):
    return create_user(db, user_data)
