from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_naver_login_url():
    response = client.get("/user/auth/naver")

    assert response.status_code == 200
    assert "url" in response.json()