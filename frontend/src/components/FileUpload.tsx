import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { OHLCVData, TradeData } from '../App';
import './FileUpload.css';

interface FileUploadProps {
  onDataLoaded: (ohlcv: OHLCVData[], trades: TradeData[]) => void;
  setLoading: (loading: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, setLoading }) => {
  const [ohlcvFile, setOhlcvFile] = useState<File | null>(null);
  const [tradesFile, setTradesFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const onDropOhlcv = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setOhlcvFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const onDropTrades = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setTradesFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps: getOhlcvRootProps, getInputProps: getOhlcvInputProps, isDragActive: isOhlcvDragActive } = useDropzone({
    onDrop: onDropOhlcv,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const { getRootProps: getTradesRootProps, getInputProps: getTradesInputProps, isDragActive: isTradesDragActive } = useDropzone({
    onDrop: onDropTrades,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleSubmit = async () => {
    if (!ohlcvFile || !tradesFile) {
      setError('Please upload both OHLCV and Trades CSV files');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('ohlcv_file', ohlcvFile);
      formData.append('trades_file', tradesFile);

      const response = await axios.post('http://localhost:8000/api/process-chart-data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onDataLoaded(response.data.ohlcv, response.data.trades);
      } else {
        setError('Failed to process data');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload files. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOhlcvFile(null);
    setTradesFile(null);
    setError('');
  };

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <h2>Upload Files</h2>

        <div className="file-drop-zones">
          <div className="file-drop-zone">
            <h3>OHLCV Data</h3>
            <p>CSV with columns: DateTime, Open, High, Low, Close, Volume</p>
            <div {...getOhlcvRootProps()} className={`drop-zone ${isOhlcvDragActive ? 'active' : ''}`}>
              <input {...getOhlcvInputProps()} />
              {ohlcvFile ? (
                <p>Selected: {ohlcvFile.name}</p>
              ) : (
                <p>Drag & drop OHLCV CSV file here, or click to select</p>
              )}
            </div>
          </div>

          <div className="file-drop-zone">
            <h3>Trades Data</h3>
            <p>CSV with columns: DateTime, Entry, Exit, TakeProfit, StopLoss, Reason</p>
            <div {...getTradesRootProps()} className={`drop-zone ${isTradesDragActive ? 'active' : ''}`}>
              <input {...getTradesInputProps()} />
              {tradesFile ? (
                <p>Selected: {tradesFile.name}</p>
              ) : (
                <p>Drag & drop Trades CSV file here, or click to select</p>
              )}
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="upload-buttons">
          <button
            onClick={handleSubmit}
            disabled={!ohlcvFile || !tradesFile}
            className="upload-btn"
          >
            Generate Chart
          </button>
          <button onClick={handleReset} className="reset-btn">
            Reset
          </button>
        </div>

        <div className="instructions">
          <h3>CSV Format Requirements:</h3>
          <div className="format-examples">
            <div>
              <strong>OHLCV CSV:</strong>
              <pre>DateTime,Open,High,Low,Close,Volume
2024-01-01 09:30:00,100.0,105.0,95.0,102.0,1000</pre>
            </div>
            <div>
              <strong>Trades CSV:</strong>
              <pre>DateTime,Entry,Exit,TakeProfit,StopLoss,Reason
2024-01-01 09:30:00,100.0,105.0,110.0,95.0,Take Profit</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;