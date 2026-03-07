from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Import layers
from models import Alert, AlertCreate, MetricData, AlertEvent
from repositories import AlertRepository
from services import AlertService
from utils import ConnectionManager

app = FastAPI(title="Real-Time Metric Alerting Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize layers
alert_repository = AlertRepository()
alert_service = AlertService(alert_repository)
websocket_manager = ConnectionManager()

# API Routes
@app.on_event("startup")
async def startup_event():
    # Database initialization is handled in repository constructor
    pass

@app.get("/")
async def root():
    return {"message": "Real-Time Metric Alerting Platform API"}

@app.post("/alerts", response_model=Alert)
async def create_alert(alert: AlertCreate):
    try:
        return alert_service.create_alert(alert)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alerts", response_model=List[Alert])
async def get_alerts():
    try:
        return alert_service.get_all_alerts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str):
    try:
        success = alert_service.delete_alert(alert_id)
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {"message": "Alert deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/metrics")
async def submit_metric(metric: MetricData):
    try:
        # Evaluate metric against alerts
        triggered_alerts = alert_service.evaluate_metric(metric)
        
        # Broadcast triggered alerts via WebSocket
        if triggered_alerts:
            await websocket_manager.broadcast_alert_events(triggered_alerts)
        
        return {"message": f"Processed {len(triggered_alerts)} alert triggers"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alert-events", response_model=List[AlertEvent])
async def get_alert_events():
    try:
        return alert_service.get_alert_events()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or handle client messages if needed
            await websocket_manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
