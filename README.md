# Real-Time Metric Alerting Platform

A full-stack web application for configuring alert rules, ingesting metric data, evaluating metrics against alert rules, triggering alert events, and viewing alert history.

## 🏗️ Architecture

### Backend (FastAPI + SQLite)
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLite**: Lightweight, serverless database for data persistence
- **WebSocket**: Real-time communication for instant alert notifications
- **Pydantic**: Data validation and serialization

### Frontend (React + Vite + TailwindCSS)
- **React 18**: Modern UI library with hooks
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client for API communication

## 🚀 Features

### Core Functionality
- ✅ **Alert Configuration Management**: Create, view, and delete alert rules
- ✅ **Metric Ingestion**: Submit metric data via REST API
- ✅ **Alert Evaluation**: Real-time evaluation of metrics against alert rules
- ✅ **Alert Events**: Store and view triggered alert history
- ✅ **Real-time Updates**: WebSocket integration for live alert notifications

### Alert Comparators Supported
- `GT` (Greater Than)
- `LT` (Less Than)
- `GTE` (Greater Than or Equal)
- `LTE` (Less Than or Equal)
- `EQ` (Equal)

### UI Features
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Loading States**: Visual feedback during API calls
- 🔄 **Auto-refresh**: Optional auto-refresh for alert events
- 🎨 **Modern UI**: Clean, intuitive interface with TailwindCSS
- 📊 **Event Statistics**: Summary metrics and insights

## 📋 API Endpoints

### Alert Management
- `POST /alerts` - Create a new alert rule
- `GET /alerts` - Retrieve all alert rules
- `DELETE /alerts/{id}` - Delete a specific alert rule

### Metrics & Events
- `POST /metrics` - Submit metric data for evaluation
- `GET /alert-events` - Retrieve triggered alert events

### WebSocket
- `WS /ws` - Real-time alert notifications

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd ARF
npm run install-all
```

2. **Start the development servers:**
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:8000`
- Frontend development server on `http://localhost:5173`

3. **Access the application:**
Open your browser and navigate to `http://localhost:5173`

### Manual Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📖 Usage Guide

### 1. Create Alert Rules
1. Navigate to the **Alerts** page
2. Click "Create Alert"
3. Fill in the alert configuration:
   - **Metric Name**: e.g., "cpu_usage", "memory_usage"
   - **Threshold**: Numeric value to trigger alert
   - **Comparator**: Comparison operator (GT, LT, GTE, LTE, EQ)
   - **Alert Message**: Descriptive message for the alert

### 2. Submit Metric Data
1. Navigate to the **Metrics** page
2. Use the predefined metrics (CPU, Memory, Disk, API Latency, Error Rate)
3. Or submit custom metrics
4. Click individual submit buttons or "Submit All Metrics"

### 3. Monitor Alert Events
1. Navigate to the **Events** page
2. View triggered alerts in chronological order
3. Enable auto-refresh for real-time updates
4. View event statistics and insights

## 🎯 Design Decisions & Trade-offs

### Intentional Design Choices

#### Alert Firing Behavior
- **Decision**: Alerts fire for **every metric submission** that meets the criteria
- **Rationale**: Simplicity and immediate feedback
- **Trade-off**: May generate high volume of alerts for sustained threshold breaches

#### Cooldown/Throttling
- **Decision**: **Not implemented** in base version
- **Rationale**: Keeps core logic simple and transparent
- **Trade-off**: Users may receive alert fatigue during sustained issues

#### Duplicate Prevention
- **Decision**: **No duplicate prevention** for alert events
- **Rationale**: Each metric submission is treated as a distinct event
- **Trade-off**: Event history may contain repetitive entries

#### Evaluation Processing
- **Decision**: **Synchronous** evaluation
- **Rationale**: Simpler implementation, immediate feedback
- **Trade-off**: May impact performance under high load

#### Metric Storage
- **Decision**: **No permanent metric storage** (only alert events stored)
- **Rationale**: Focus on alerting functionality, reduce storage requirements
- **Trade-off**: Limited historical analysis capabilities

#### Multi-user Support
- **Decision**: **Single-user system**
- **Rationale**: Simplifies authentication and data isolation
- **Trade-off**: Not suitable for multi-tenant environments

### Technical Trade-offs

#### Database Choice
- **SQLite** chosen for simplicity and zero-configuration
- **Trade-off**: Limited concurrency compared to PostgreSQL/MySQL

#### Frontend Framework
- **Vite + React** chosen for development speed and modern tooling
- **Trade-off**: Less mature than Create React App ecosystem

#### State Management
- **Local component state** used for simplicity
- **Trade-off**: May become complex as application grows

## 🎁 Bonus Features Implemented

### ✅ Additional Comparators
- GTE (Greater Than or Equal)
- LTE (Less Than or Equal)  
- EQ (Equal)

### ✅ WebSocket Integration
- Real-time alert notifications
- Live updates when alerts are triggered

### ✅ Modern UI/UX
- Responsive design with TailwindCSS
- Loading states and error handling
- Intuitive navigation and user feedback

### ✅ Event Statistics
- Real-time event counting
- Metric frequency analysis
- Time-based filtering insights

## 🔧 Future Enhancements

### Potential Improvements
- [ ] Alert cooldown/throttling mechanisms
- [ ] Range-based alerts (between X and Y)
- [ ] Asynchronous processing with message queues
- [ ] Metric history and trend analysis
- [ ] User authentication and multi-tenancy
- [ ] Alert severity levels
- [ ] Email/SMS notifications
- [ ] Dashboard with charts and visualizations
- [ ] Alert rule templates
- [ ] Bulk operations for alerts
- [ ] Export/import alert configurations
- [ ] API rate limiting
- [ ] Integration with external monitoring systems

### Scalability Considerations
- [ ] Database migration to PostgreSQL/MySQL
- [ ] Redis for caching and session management
- [ ] Containerization with Docker
- [ ] Kubernetes deployment
- [ ] Load balancing and horizontal scaling
- [ ] Microservices architecture

## 🧪 Testing

### Running Tests
```bash
# Backend tests (when implemented)
cd backend && python -m pytest

# Frontend tests (when implemented)  
cd frontend && npm test
```

## 📝 Development Notes

### Project Structure
```
ARF/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── alerts.db           # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Node.js dependencies
│   └── vite.config.js     # Vite configuration
├── package.json           # Root package.json for scripts
└── README.md             # This file
```

### Environment Variables
No environment variables required for basic setup. For production:
- `DATABASE_URL`: Database connection string
- `CORS_ORIGINS`: Allowed frontend origins
- `LOG_LEVEL`: Logging configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Built with ❤️ using FastAPI, React, and modern web technologies**
