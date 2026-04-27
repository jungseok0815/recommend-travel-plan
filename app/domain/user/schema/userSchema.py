from pydantic import BaseModel

class UserCreate(BaseModel):    # POST /user/signup 요청 body
    email: str
    password: str
    address: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    address: str
    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
