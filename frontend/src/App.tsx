import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import Chart from './components/Chart';

export interface OHLCVData {
  DateTime: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  timestamp?: number;
}

export interface TradeData {
  DateTime: string;
  Entry: number;
  Exit: number;
  TakeProfit: number;
  StopLoss: number;
  Reason?: string;
  timestamp?: number;
}

function App() {
  const [ohlcvData, setOhlcvData] = useState<OHLCVData[]>([]);
  const [tradesData, setTradesData] = useState<TradeData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDataLoaded = (ohlcv: OHLCVData[], trades: TradeData[]) => {
    setOhlcvData(ohlcv);
    setTradesData(trades);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Charting Solution</h1>
        <p>Upload OHLCV and Trades CSV files to visualize trading charts</p>
      </header>

      <main className="App-main">
        {!ohlcvData.length && !tradesData.length ? (
          <FileUpload onDataLoaded={handleDataLoaded} setLoading={setLoading} />
        ) : (
          <Chart ohlcvData={ohlcvData} tradesData={tradesData} />
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing data...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;