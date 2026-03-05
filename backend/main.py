from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime
import json
import asyncio

app = FastAPI(title="Real-Time Metric Alerting Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database
alerts_db: Dict[str, dict] = {}
alert_events_db: Dict[str, dict] = {}

# Database setup (no initialization needed for in-memory)
def init_db():
    # No initialization needed for in-memory storage
    pass

# Pydantic models
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

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Connection might be closed, remove it
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Alert evaluation logic
def evaluate_alert(alert: Alert, metric_value: float) -> bool:
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

# API Routes
@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "Real-Time Metric Alerting Platform API"}

@app.post("/alerts", response_model=Alert)
async def create_alert(alert: AlertCreate):
    alert_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    
    alerts_db[alert_id] = {
        "id": alert_id,
        "metric_name": alert.metric_name,
        "threshold": alert.threshold,
        "comparator": alert.comparator,
        "alert_message": alert.alert_message,
        "created_at": created_at
    }
    
    return Alert(
        id=alert_id,
        metric_name=alert.metric_name,
        threshold=alert.threshold,
        comparator=alert.comparator,
        alert_message=alert.alert_message,
        created_at=created_at
    )

@app.get("/alerts", response_model=List[Alert])
async def get_alerts():
    alerts = []
    for alert_data in alerts_db.values():
        alerts.append(Alert(
            id=alert_data["id"],
            metric_name=alert_data["metric_name"],
            threshold=alert_data["threshold"],
            comparator=alert_data["comparator"],
            alert_message=alert_data["alert_message"],
            created_at=alert_data["created_at"]
        ))
    
    # Sort by created_at descending
    alerts.sort(key=lambda x: x.created_at, reverse=True)
    return alerts

@app.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str):
    if alert_id not in alerts_db:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    del alerts_db[alert_id]
    return {"message": "Alert deleted successfully"}

@app.post("/metrics")
async def submit_metric(metric: MetricData):
    # Get all alerts for this metric from in-memory database
    triggered_alerts = []
    
    for alert_data in alerts_db.values():
        if alert_data["metric_name"] == metric.metric_name:
            alert = Alert(
                id=alert_data["id"],
                metric_name=alert_data["metric_name"],
                threshold=alert_data["threshold"],
                comparator=alert_data["comparator"],
                alert_message=alert_data["alert_message"],
                created_at=alert_data["created_at"]
            )
            
            if evaluate_alert(alert, metric.value):
                # Create alert event
                event_id = str(uuid.uuid4())
                timestamp = metric.timestamp or datetime.now()
                
                alert_events_db[event_id] = {
                    "id": event_id,
                    "alert_id": alert.id,
                    "metric_name": alert.metric_name,
                    "metric_value": metric.value,
                    "timestamp": timestamp.isoformat(),
                    "alert_message": alert.alert_message
                }
                
                alert_event = AlertEvent(
                    id=event_id,
                    alert_id=alert.id,
                    metric_name=alert.metric_name,
                    metric_value=metric.value,
                    timestamp=timestamp.isoformat(),
                    alert_message=alert.alert_message
                )
                
                triggered_alerts.append(alert_event)
    
    # Broadcast triggered alerts via WebSocket
    if triggered_alerts:
        await manager.broadcast(json.dumps([alert.dict() for alert in triggered_alerts]))
    
    return {"message": f"Processed {len(triggered_alerts)} alert triggers"}

@app.get("/alert-events", response_model=List[AlertEvent])
async def get_alert_events():
    events = []
    for event_data in alert_events_db.values():
        events.append(AlertEvent(
            id=event_data["id"],
            alert_id=event_data["alert_id"],
            metric_name=event_data["metric_name"],
            metric_value=event_data["metric_value"],
            timestamp=event_data["timestamp"],
            alert_message=event_data["alert_message"]
        ))
    
    # Sort by timestamp descending and limit to 100
    events.sort(key=lambda x: x.timestamp, reverse=True)
    return events[:100]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or handle client messages if needed
            await manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
