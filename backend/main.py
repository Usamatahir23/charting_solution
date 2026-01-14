from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import json
from datetime import datetime
from typing import List, Dict, Any
import io

app = FastAPI(title="Charting Solution API", description="API for processing OHLCV and trades data")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Charting Solution API"}

@app.post("/api/upload-ohlcv")
async def upload_ohlcv(file: UploadFile = File(...)):
    """
    Upload OHLCV CSV file with format: DateTime, Open, High, Low, Close, Volume
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Validate required columns
        required_columns = ['DateTime', 'Open', 'High', 'Low', 'Close', 'Volume']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_columns}")

        # Convert DateTime to proper format
        df['DateTime'] = pd.to_datetime(df['DateTime'])
        df = df.sort_values('DateTime')
        
        # Convert DateTime to string for JSON serialization
        df['DateTime'] = df['DateTime'].dt.strftime('%Y-%m-%d %H:%M:%S')

        # Convert to records for JSON serialization
        data = df.to_dict('records')

        return JSONResponse(content={
            "success": True,
            "data": data,
            "count": len(data)
        })

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.post("/api/upload-trades")
async def upload_trades(file: UploadFile = File(...)):
    """
    Upload trades CSV file with format: DateTime, Entry, Exit, TakeProfit, StopLoss, Reason
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Validate required columns
        required_columns = ['DateTime', 'Entry', 'Exit', 'TakeProfit', 'StopLoss']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_columns}")

        # Convert DateTime to proper format
        df['DateTime'] = pd.to_datetime(df['DateTime'])
        df = df.sort_values('DateTime')
        
        # Convert DateTime to string for JSON serialization
        df['DateTime'] = df['DateTime'].dt.strftime('%Y-%m-%d %H:%M:%S')

        # Convert to records for JSON serialization
        data = df.to_dict('records')

        return JSONResponse(content={
            "success": True,
            "data": data,
            "count": len(data)
        })

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.post("/api/process-chart-data")
async def process_chart_data(
    ohlcv_file: UploadFile = File(...),
    trades_file: UploadFile = File(...)
):
    """
    Process both OHLCV and trades files together and return combined chart data
    """
    try:
        # Process OHLCV data
        ohlcv_contents = await ohlcv_file.read()
        ohlcv_df = pd.read_csv(io.BytesIO(ohlcv_contents))
        
        # Validate required columns
        required_ohlcv_columns = ['DateTime', 'Open', 'High', 'Low', 'Close', 'Volume']
        if not all(col in ohlcv_df.columns for col in required_ohlcv_columns):
            raise HTTPException(status_code=400, detail=f"OHLCV CSV must contain columns: {required_ohlcv_columns}. Found: {list(ohlcv_df.columns)}")
        
        ohlcv_df['DateTime'] = pd.to_datetime(ohlcv_df['DateTime'])
        ohlcv_df = ohlcv_df.sort_values('DateTime')
        
        # Convert DateTime to string for JSON serialization
        ohlcv_df['DateTime'] = ohlcv_df['DateTime'].dt.strftime('%Y-%m-%d %H:%M:%S')

        # Process trades data
        trades_contents = await trades_file.read()
        trades_df = pd.read_csv(io.BytesIO(trades_contents))
        
        # Validate required columns
        required_trades_columns = ['DateTime', 'Entry', 'Exit', 'TakeProfit', 'StopLoss']
        if not all(col in trades_df.columns for col in required_trades_columns):
            raise HTTPException(status_code=400, detail=f"Trades CSV must contain columns: {required_trades_columns}. Found: {list(trades_df.columns)}")
        
        trades_df['DateTime'] = pd.to_datetime(trades_df['DateTime'])
        trades_df = trades_df.sort_values('DateTime')
        
        # Convert DateTime to string for JSON serialization
        trades_df['DateTime'] = trades_df['DateTime'].dt.strftime('%Y-%m-%d %H:%M:%S')

        # Convert to records for JSON serialization
        ohlcv_records = ohlcv_df.to_dict('records')
        trades_records = trades_df.to_dict('records')

        return JSONResponse(content={
            "success": True,
            "ohlcv": ohlcv_records,
            "trades": trades_records,
            "ohlcv_count": len(ohlcv_df),
            "trades_count": len(trades_df)
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing files: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)