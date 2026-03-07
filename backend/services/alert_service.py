from typing import List
from datetime import datetime
from models.alert_models import Alert, AlertCreate, MetricData, AlertEvent
from repositories.alert_repository import AlertRepository


class AlertService:
    def __init__(self, alert_repository: AlertRepository):
        self.alert_repository = alert_repository

    def create_alert(self, alert_data: AlertCreate) -> Alert:
        return self.alert_repository.create_alert(alert_data)

    def get_all_alerts(self) -> List[Alert]:
        return self.alert_repository.get_all_alerts()

    def get_alert_by_id(self, alert_id: str) -> Alert:
        alert = self.alert_repository.get_alert_by_id(alert_id)
        if not alert:
            raise ValueError("Alert not found")
        return alert

    def delete_alert(self, alert_id: str) -> bool:
        return self.alert_repository.delete_alert(alert_id)

    def evaluate_metric(self, metric_data: MetricData) -> List[AlertEvent]:
        triggered_alerts = []
        
        # Get all alerts for this metric
        alerts = self.alert_repository.get_alerts_by_metric(metric_data.metric_name)
        
        for alert in alerts:
            if self._evaluate_alert_condition(alert, metric_data.value):
                # Create alert event
                alert_event = self.alert_repository.create_alert_event(
                    alert_id=alert.id,
                    metric_name=alert.metric_name,
                    metric_value=metric_data.value,
                    alert_message=alert.alert_message,
                    timestamp=metric_data.timestamp
                )
                triggered_alerts.append(alert_event)
        
        return triggered_alerts

    def get_alert_events(self, limit: int = 100) -> List[AlertEvent]:
        return self.alert_repository.get_all_alert_events(limit)

    def _evaluate_alert_condition(self, alert: Alert, metric_value: float) -> bool:
        if alert.comparator == "GT":
            return metric_value > alert.threshold
        elif alert.comparator == "LT":
            return metric_value < alert.threshold
        elif alert.comparator == "GTE":
            return metric_value >= alert.threshold
        elif alert.comparator == "LTE":
            return metric_value <= alert.threshold
        elif alert.comparator == "EQ":
            return metric_value == alert.threshold
        return False
