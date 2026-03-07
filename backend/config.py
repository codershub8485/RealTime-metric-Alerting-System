from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Real-Time Metric Alerting Platform"
    debug: bool = True
    cors_origins: list = ["http://localhost:5173"]
    max_alert_events: int = 100
    
    class Config:
        env_file = ".env"


settings = Settings()
