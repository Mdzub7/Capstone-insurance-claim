from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.claim import ClaimCreate, ClaimResponse
from app.services.claim_service import ClaimService

router = APIRouter()

# Dependency Injection: We inject the service. 
# This makes unit testing easier (we can mock the service later).
def get_claim_service():
    return ClaimService()

@router.post("/", response_model=ClaimResponse, status_code=201)
def submit_claim(
    claim: ClaimCreate, 
    service: ClaimService = Depends(get_claim_service)
):
    """
    Submit a new insurance claim.
    Returns the claim details and a Presigned URL to upload documents.
    """
    try:
        return service.create_claim(claim)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=List)
def list_user_claims(
    user_id: str, 
    service: ClaimService = Depends(get_claim_service)
):
    return service.get_claims_by_user(user_id)
