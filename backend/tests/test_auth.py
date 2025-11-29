from fastapi.testclient import TestClient
from app.main import app
from app.services.auth_service import AuthService
from app.schemas.auth import RegisterRequest, RegisterResponse, LoginRequest, LoginResponse


class MockAuth(AuthService):
    def register(self, req: RegisterRequest) -> RegisterResponse:
        return RegisterResponse(user_id="u1", patient_id="PAT-1234")

    def login(self, req: LoginRequest) -> LoginResponse:
        return LoginResponse(token="t", role="patient", user_id="u1", patient_id="PAT-1234")


app.dependency_overrides[AuthService] = lambda: MockAuth()


def test_register():
    c = TestClient(app)
    r = c.post("/api/v1/auth/register", json={"email": "a@b.com", "password": "Password1!", "role": "patient", "name": "A"})
    assert r.status_code == 201
    body = r.json()
    assert body["patient_id"] == "PAT-1234"


def test_login():
    c = TestClient(app)
    r = c.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "Password1!"})
    assert r.status_code == 200
    body = r.json()
    assert body["role"] == "patient"
