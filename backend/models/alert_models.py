from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertCreate(BaseModel):
    metric_name: str
    threshold: float
    comparator: str  # GT, LT, GTE, LTE, EQ
    alert_message: str


class Alert(BaseModel):
    id: str
    metric_name: str
    threshold: float
    comparator: str
    alert_message: str
    created_at: str


class MetricData(BaseModel):
    metric_name: str
    value: float
    timestamp: Optional[datetime] = None


class AlertEvent(BaseModel):
    id: str
    alert_id: str
    metric_name: str
    metric_value: float
    timestamp: str
    alert_message: str
