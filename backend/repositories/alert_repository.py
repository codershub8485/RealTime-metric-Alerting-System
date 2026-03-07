from typing import List, Dict
import uuid
from datetime import datetime
from models.alert_models import Alert, AlertCreate, AlertEvent, MetricData


class AlertRepository:
    def __init__(self):
        self.alerts_db: Dict[str, dict] = {}
        self.alert_events_db: Dict[str, dict] = {}

    def create_alert(self, alert_data: AlertCreate) -> Alert:
        alert_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        
        alert_dict = {
            "id": alert_id,
            "metric_name": alert_data.metric_name,
            "threshold": alert_data.threshold,
            "comparator": alert_data.comparator,
            "alert_message": alert_data.alert_message,
            "created_at": created_at
        }
        
        self.alerts_db[alert_id] = alert_dict
        
        return Alert(**alert_dict)

    def get_all_alerts(self) -> List[Alert]:
        alerts = []
        for alert_data in self.alerts_db.values():
            alerts.append(Alert(**alert_data))
        
        # Sort by created_at descending
        alerts.sort(key=lambda x: x.created_at, reverse=True)
        return alerts

    def get_alert_by_id(self, alert_id: str) -> Alert:
        if alert_id not in self.alerts_db:
            return None
        return Alert(**self.alerts_db[alert_id])

    def delete_alert(self, alert_id: str) -> bool:
        if alert_id not in self.alerts_db:
            return False
        del self.alerts_db[alert_id]
        return True

    def get_alerts_by_metric(self, metric_name: str) -> List[Alert]:
        alerts = []
        for alert_data in self.alerts_db.values():
            if alert_data["metric_name"] == metric_name:
                alerts.append(Alert(**alert_data))
        return alerts

    def create_alert_event(self, alert_id: str, metric_name: str, 
                          metric_value: float, alert_message: str, 
                          timestamp: datetime = None) -> AlertEvent:
        event_id = str(uuid.uuid4())
        event_timestamp = timestamp or datetime.now()
        
        event_dict = {
            "id": event_id,
            "alert_id": alert_id,
            "metric_name": metric_name,
            "metric_value": metric_value,
            "timestamp": event_timestamp.isoformat(),
            "alert_message": alert_message
        }
        
        self.alert_events_db[event_id] = event_dict
        
        return AlertEvent(**event_dict)

    def get_all_alert_events(self, limit: int = 100) -> List[AlertEvent]:
        events = []
        for event_data in self.alert_events_db.values():
            events.append(AlertEvent(**event_data))
        
        # Sort by timestamp descending and limit
        events.sort(key=lambda x: x.timestamp, reverse=True)
        return events[:limit]
