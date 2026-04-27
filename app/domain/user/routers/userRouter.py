from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.domain.user.schema.userSchema import UserCreate, UserLogin
from app.domain.user.services.userService import create_user, login_user,select_user

router = APIRouter(prefix="/user")

@router.post("/signup")
def signup(user_data: UserCreate,  db: Session = Depends(get_db)):
    return create_user(db, user_data)

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, user_data)

@router.get("/me")
def select(db: Session = Depends(get_db)):
    return select_user(db, user_data)
