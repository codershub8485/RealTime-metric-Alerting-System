# Backend Architecture

## Layered Architecture Design

The backend follows a clean layered architecture pattern with clear separation of concerns:

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration settings
├── models/                # Data models and schemas
│   ├── __init__.py
│   └── alert_models.py    # Pydantic models
├── repositories/          # Data access layer
│   ├── __init__.py
│   └── alert_repository.py # Database operations
├── services/              # Business logic layer
│   ├── __init__.py
│   └── alert_service.py   # Alert evaluation logic
├── utils/                 # Utility classes
│   ├── __init__.py
│   └── websocket_manager.py # WebSocket management
└── requirements.txt       # Dependencies
```

## Layer Responsibilities

### 1. Models Layer (`models/`)
- **Purpose**: Define data structures and validation schemas
- **Components**: Pydantic models for API requests/responses
- **Examples**: `Alert`, `AlertCreate`, `MetricData`, `AlertEvent`

### 2. Repository Layer (`repositories/`)
- **Purpose**: Data access and storage operations
- **Components**: Database CRUD operations
- **Examples**: `AlertRepository` with methods for alerts and events storage

### 3. Service Layer (`services/`)
- **Purpose**: Business logic and rule evaluation
- **Components**: Alert evaluation, metric processing
- **Examples**: `AlertService` with alert condition evaluation logic

### 4. Utils Layer (`utils/`)
- **Purpose**: Shared utilities and helper classes
- **Components**: WebSocket management, common utilities
- **Examples**: `ConnectionManager` for real-time communications

### 5. Configuration Layer (`config.py`)
- **Purpose**: Application settings and environment variables
- **Components**: Settings class with configuration values

## Data Flow

1. **Request** → FastAPI route handler
2. **Route** → Service layer (business logic)
3. **Service** → Repository layer (data access)
4. **Repository** → Database/storage
5. **Response** flows back through layers

## Benefits of This Architecture

- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to unit test individual layers
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Easy to add new features or modify existing ones
- **Reusability**: Services and repositories can be reused across different endpoints

## Example Usage

```python
# Initialize layers
repository = AlertRepository()
service = AlertService(repository)

# Create an alert
alert = service.create_alert(AlertCreate(
    metric_name="cpu_usage",
    threshold=80.0,
    comparator="GT",
    alert_message="High CPU usage detected"
))

# Evaluate metric
events = service.evaluate_metric(MetricData(
    metric_name="cpu_usage",
    value=85.5
))
```

## Migration from Monolithic

The original `main_old.py` contained all logic in a single file. The new architecture:
- Separated data models into `models/`
- Moved database operations to `repositories/`
- Extracted business logic to `services/`
- Isolated WebSocket handling in `utils/`
- Added configuration management

This makes the codebase more maintainable and follows industry best practices.
