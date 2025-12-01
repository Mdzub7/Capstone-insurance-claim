from fastapi.testclient import TestClient
from app.main import app
from app.services.claim_service import ClaimService
from app.schemas.claim import ClaimCreate, ClaimResponse


class MockClaim(ClaimService):
    def create_claim(self, claim_data: ClaimCreate, current_user: dict) -> ClaimResponse:
        return ClaimResponse(
            claim_id="c1",
            claim_status="PENDING",
            created_at="2024-01-01T00:00:00Z",
            s3_upload_url=None,
            user_id=current_user.get("sub"),
            amount=claim_data.amount,
            description=claim_data.description,
            policy_number=claim_data.policy_number,
        )

    def get_claims_by_user(self, user_id: str):
        return [{"claim_id": "c1", "claim_status": "PENDING", "amount": 100.0, "description": "Test", "policy_number": "P1"}]


app.dependency_overrides[ClaimService] = lambda: MockClaim()


def test_claims_require_auth():
    c = TestClient(app)
    r = c.get("/api/v1/claims/my")
    assert r.status_code == 401


def test_submit_claim_with_auth():
    c = TestClient(app)
    token = "dummy"
    r = c.post("/api/v1/claims/", json={"amount": 100.0, "description": "X", "policy_number": "P"}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 201
