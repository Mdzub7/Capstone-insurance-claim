from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import claims, auth, users, admin
from app.core.logging import setup_logging
from app.routers import logs

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

# Logging setup
setup_logging()

# Include the router
app.include_router(claims.router, prefix="/api/v1/claims", tags=["Claims"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(logs.router, prefix="/api/v1/logs", tags=["Logs"])

@app.get("/")
def health_check():
    """Lightweight health endpoint for readiness/liveness probes."""
    return {"status": "healthy", "service": "insurance-backend"}
