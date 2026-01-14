# Charting Solution

A web application for visualizing OHLCV (Open, High, Low, Close, Volume) candlestick charts with trade overlays.

## Features

- Upload OHLCV and trades CSV files
- Interactive candlestick charts
- Trade entry/exit overlays with TP/SL levels
- Hover tooltips showing OHLCV data and timestamps
- Responsive design

## Tech Stack

- **Backend**: Python FastAPI
- **Frontend**: React with TypeScript
- **Charts**: Chart.js with custom candlestick rendering
- **File Upload**: React Dropzone

## Project Structure

```
charting_solution/
├── backend/
│   ├── main.py              # FastAPI server
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.tsx
│   │   │   └── Chart.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json         # Node dependencies
└── README.md
```

## CSV File Formats

### OHLCV Data Format
```csv
DateTime,Open,High,Low,Close,Volume
2024-01-01 09:30:00,100.0,105.0,95.0,102.0,1000
2024-01-01 09:31:00,102.0,106.0,98.0,104.0,1200
```

### Trades Data Format
```csv
DateTime,Entry,Exit,TakeProfit,StopLoss,Reason
2024-01-01 09:30:00,100.0,105.0,110.0,95.0,Take Profit
2024-01-01 10:15:00,104.0,99.0,109.0,98.0,Stop Loss
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
python main.py
```
The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```
The frontend will be available at `http://localhost:3001`

## Quick Start

Both servers should be running simultaneously:

1. **Terminal 1** - Start the backend:
```bash
cd backend && python main.py
```

2. **Terminal 2** - Start the frontend:
```bash
cd frontend && PORT=3001 npm start
```

3. Open your browser to `http://localhost:3001`
4. Upload the sample CSV files or your own data
5. View the interactive chart with trade overlays

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. Upload your OHLCV CSV file (drag & drop or click to select)
4. Upload your trades CSV file
5. Click "Generate Chart" to view the interactive chart

## API Endpoints

- `GET /` - Health check
- `POST /api/upload-ohlcv` - Upload OHLCV CSV file
- `POST /api/upload-trades` - Upload trades CSV file
- `POST /api/process-chart-data` - Process both files together

## Development

### Adding New Features

- Backend: Add new endpoints in `backend/main.py`
- Frontend: Add new components in `frontend/src/components/`

### Testing

- Create sample CSV files in the root directory for testing
- Use the provided sample data formats

## Troubleshooting

### Backend Issues
- Ensure all Python dependencies are installed
- Check that port 8000 is not in use
- Verify CSV file formats match the expected structure

### Frontend Issues
- Ensure Node.js and npm are installed
- Check that port 3000 is not in use
- Clear npm cache if needed: `npm cache clean --force`

## License

This project is open source and available under the MIT License.