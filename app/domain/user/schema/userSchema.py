from pydantic import BaseModel

class UserCreate(BaseModel):
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

class UserUpdate(BaseModel):
    address: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    refresh_token : str

class RefreshTokenRequest(BaseModel):
    refresh_token: str
