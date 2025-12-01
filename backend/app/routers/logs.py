from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from app.services.log_service import LogService
from app.core.security import get_current_user

router = APIRouter()

class LogEntry(BaseModel):
    level: str
    event: str
    context: Optional[Dict] = None

def get_log_service():
    return LogService()

@router.post("/")
def write_log(entry: LogEntry, svc: LogService = Depends(get_log_service), user: dict = Depends(get_current_user)):
    return svc.write_log(entry.level, entry.event, user.get('sub'), entry.context)

