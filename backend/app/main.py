from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- Import this
from app.routers import claims

app = FastAPI(
    title="Cloud-Native Insurance API",
    version="1.0.0"
)

# --- ADD CORS MIDDLEWARE HERE ---
# This allows the frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (Safe for Dev, restrict in Prod)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include the router
app.include_router(claims.router, prefix="/api/v1/claims", tags=["Claims"])

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "insurance-backend"}
