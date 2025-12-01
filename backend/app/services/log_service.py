import uuid
import datetime
from typing import Optional, Dict
from app.core.database import get_dynamodb_table

class LogService:
    def write_log(self, level: str, event: str, user_id: Optional[str], context: Optional[Dict]):
        table = get_dynamodb_table()
        item = {
            'claim_id': f"LOG#{str(uuid.uuid4())}",
            'level': level,
            'event': event,
            'user_id': user_id,
            'context': context or {},
            'created_at': datetime.datetime.utcnow().isoformat()
        }
        table.put_item(Item=item)
        return {'status': 'ok'}

