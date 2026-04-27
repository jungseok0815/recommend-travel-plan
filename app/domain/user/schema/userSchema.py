from pydantic import BaseModel

class UserCreate(BaseModel):    # POST /user/signup 요청 body
      email: str
      password: str
