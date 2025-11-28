from fastapi import FastAPI
from app.routers import claims

app = FastAPI(
    title="Cloud-Native Insurance API",
    version="1.0.0"
)

# Include the router
app.include_router(claims.router, prefix="/api/v1/claims", tags=["Claims"])

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "insurance-backend"}
