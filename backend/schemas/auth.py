from pydantic import BaseModel, Field

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    email: str
