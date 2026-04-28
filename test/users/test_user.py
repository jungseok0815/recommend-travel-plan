from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_signup():
    response = client.post("/user/signup", json= {
        "email" : "test@test.com",
        "password" : "1234",
        "address": "서울"
    })
    assert response.status_code == 200



