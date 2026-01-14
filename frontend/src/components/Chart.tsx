import React, { useRef, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  TimeScale,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
// @ts-expect-error - chartjs-plugin-zoom types may not be perfect
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { OHLCVData, TradeData } from '../App';
import './Chart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  TimeScale,
  zoomPlugin
);

interface ChartProps {
  ohlcvData: OHLCVData[];
  tradesData: TradeData[];
}

const ChartComponent: React.FC<ChartProps> = ({ ohlcvData, tradesData }) => {
  const chartRef = useRef<ChartJS<'line', any>>(null);

  // Custom candlestick drawing
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    const ctx = chart.ctx;

    // Override the draw function to add candlestick bodies
    const originalDraw = chart.draw;
    chart.draw = function() {
      originalDraw.call(this);

      if (!ohlcvData.length) return;

      const meta = chart.getDatasetMeta(0);
      const points = meta.data;

      // Calculate candle width based on chart width and number of candles
      const chartWidth = chart.width;
      const candleCount = Math.min(ohlcvData.length, points.length);
      const availableWidth = chartWidth * 0.8; // Use 80% of chart width
      const candleWidth = Math.max(2, Math.min(8, availableWidth / candleCount));

      points.forEach((point, index) => {
        if (index >= ohlcvData.length) return;

        const candle = ohlcvData[index];
        const x = point.x;
        const open = chart.scales.y.getPixelForValue(candle.Open);
        const high = chart.scales.y.getPixelForValue(candle.High);
        const low = chart.scales.y.getPixelForValue(candle.Low);
        const close = chart.scales.y.getPixelForValue(candle.Close);

        // Draw wick (high-low line)
        ctx.strokeStyle = candle.Close >= candle.Open ? '#26a69a' : '#ef5350';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, high);
        ctx.lineTo(x, low);
        ctx.stroke();

        // Draw body (open-close rectangle)
        const bodyTop = Math.min(open, close);
        const bodyBottom = Math.max(open, close);
        const bodyHeight = Math.max(1, bodyBottom - bodyTop); // Minimum 1px height

        ctx.fillStyle = candle.Close >= candle.Open ? '#26a69a' : '#ef5350';
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    };

    chart.update();
  }, [ohlcvData]);

  // Create a map of candles by DateTime for quick lookup
  const candlesByDateTime = useMemo(() => {
    const map = new Map<string, OHLCVData>();
    ohlcvData.forEach(candle => {
      map.set(candle.DateTime, candle);
    });
    return map;
  }, [ohlcvData]);

  // Create a map of trades by DateTime for quick lookup
  const tradesByDateTime = useMemo(() => {
    const map = new Map<string, TradeData>();
    tradesData.forEach(trade => {
      map.set(trade.DateTime, trade);
    });
    return map;
  }, [tradesData]);

  // Determine if trade is long or short
  const isLongTrade = (trade: TradeData): boolean => {
    return trade.Exit > trade.Entry;
  };

  const formatData = () => {
    if (!ohlcvData.length) return { labels: [], datasets: [] };

    // Prepare main price data (we'll use close prices for the line, but draw candlesticks)
    const labels = ohlcvData.map(d => new Date(d.DateTime));
    const closePrices = ohlcvData.map(d => d.Close);

    // Prepare trade markers - separate long and short trades
    const longTrades = tradesData.filter(trade => isLongTrade(trade));
    const shortTrades = tradesData.filter(trade => !isLongTrade(trade));

    // Long trade markers (green) - positioned at candle Low
    const longEntryPoints = longTrades.map(trade => {
      const candle = candlesByDateTime.get(trade.DateTime);
      // Position at candle Low (below the candle)
      const yPosition = candle ? candle.Low : trade.Entry;
      return {
        x: new Date(trade.DateTime),
        y: yPosition,
        trade,
        isLong: true
      };
    });

    // Short trade markers (red) - positioned at candle High
    const shortEntryPoints = shortTrades.map(trade => {
      const candle = candlesByDateTime.get(trade.DateTime);
      // Position at candle High (above the candle)
      const yPosition = candle ? candle.High : trade.Entry;
      return {
        x: new Date(trade.DateTime),
        y: yPosition,
        trade,
        isLong: false
      };
    });

    return {
      labels,
      datasets: [
        // Main price line (invisible, just for scale)
        {
          label: 'Close Price',
          data: closePrices,
          borderColor: 'rgba(0,0,0,0)',
          backgroundColor: 'rgba(0,0,0,0)',
          pointRadius: 0,
          tension: 0,
        },
        // Long trade entry points (green triangle up)
        {
          label: 'Long Entry',
          data: longEntryPoints,
          pointBackgroundColor: '#4CAF50',
          pointBorderColor: '#4CAF50',
          pointRadius: 8,
          pointStyle: 'triangle',
          rotation: 0,
          showLine: false,
        },
        // Short trade entry points (red triangle down)
        {
          label: 'Short Entry',
          data: shortEntryPoints,
          pointBackgroundColor: '#F44336',
          pointBorderColor: '#F44336',
          pointRadius: 8,
          pointStyle: 'triangle',
          rotation: 180,
          showLine: false,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
          modifierKey: 'shift' as const,
        },
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: 'original', max: 'original' },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (context: any) => {
            if (!context || !context.length || context[0] === undefined) {
              return '';
            }
            
            const firstContext = context[0];
            const datasetIndex = firstContext.datasetIndex;
            
            // For main price dataset (index 0), show candle timestamp
            if (datasetIndex === 0 && firstContext.dataIndex !== undefined) {
              const index = firstContext.dataIndex;
              if (index >= 0 && index < ohlcvData.length) {
                const candle = ohlcvData[index];
                return new Date(candle.DateTime).toLocaleString();
              }
            }
            
            // For trade datasets, show trade timestamp
            if (firstContext.raw && firstContext.raw.trade) {
              const trade = firstContext.raw.trade;
              return new Date(trade.DateTime).toLocaleString();
            }
            
            // Fallback: try to get timestamp from raw data
            if (firstContext.raw && firstContext.raw.x) {
              return new Date(firstContext.raw.x).toLocaleString();
            }
            
            return '';
          },
          label: (context: any) => {
            if (!context || context.datasetIndex === undefined) {
              return '';
            }
            
            const datasetIndex = context.datasetIndex;
            
            // Main price dataset (candlestick data)
            if (datasetIndex === 0) {
              if (context.dataIndex !== undefined && context.dataIndex >= 0 && context.dataIndex < ohlcvData.length) {
                const candle = ohlcvData[context.dataIndex];
                const labels = [
                  `Open: ${candle.Open}`,
                  `High: ${candle.High}`,
                  `Low: ${candle.Low}`,
                  `Close: ${candle.Close}`,
                  `Volume: ${candle.Volume}`,
                ];
                
                // Check if there's a trade on this candle
                const trade = tradesByDateTime.get(candle.DateTime);
                if (trade) {
                  const tradeType = isLongTrade(trade) ? 'Long' : 'Short';
                  labels.push(''); // Empty line separator
                  labels.push(`Trade: ${tradeType}`);
                  labels.push(`Entry: ${trade.Entry}`);
                  labels.push(`Exit: ${trade.Exit}${trade.Reason ? ` (${trade.Reason})` : ''}`);
                  labels.push(`Take Profit: ${trade.TakeProfit}`);
                  labels.push(`Stop Loss: ${trade.StopLoss}`);
                }
                
                return labels;
              }
              return '';
            }
            
            // Trade datasets (Long/Short Entry markers)
            if (context.raw && context.raw.trade) {
              const trade = context.raw.trade;
              const tradeType = context.raw.isLong ? 'Long' : 'Short';
              return [
                `${tradeType} Trade Entry`,
                `Entry: ${trade.Entry}`,
                `Exit: ${trade.Exit}${trade.Reason ? ` (${trade.Reason})` : ''}`,
                `Take Profit: ${trade.TakeProfit}`,
                `Stop Loss: ${trade.StopLoss}`,
              ];
            }
            
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const,
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM dd',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price',
        },
        beginAtZero: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  const handleBackToUpload = () => {
    window.location.reload(); // Simple way to reset, could be improved
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      // @ts-ignore - resetZoom is added by chartjs-plugin-zoom
      (chartRef.current as any).resetZoom();
    }
  };

  if (!ohlcvData.length) {
    return <div className="no-data">No chart data available</div>;
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Trading Chart</h2>
        <div className="chart-controls">
          <button onClick={handleResetZoom} className="reset-zoom-btn">
            Reset Zoom
          </button>
          <button onClick={handleBackToUpload} className="back-btn">
            Upload New Files
          </button>
        </div>
      </div>

      <div className="chart-wrapper">
        <Chart
          ref={chartRef}
          type="line"
          data={formatData()}
          options={options}
        />
      </div>

      <div className="chart-info">
        <div className="info-item">
          <span className="label">Candles:</span>
          <span className="value">{ohlcvData.length}</span>
        </div>
        <div className="info-item">
          <span className="label">Trades:</span>
          <span className="value">{tradesData.length}</span>
        </div>
        <div className="info-item">
          <span className="label">Period:</span>
          <span className="value">
            {ohlcvData.length > 0 ? `${new Date(ohlcvData[0].DateTime).toLocaleDateString()} - ${new Date(ohlcvData[ohlcvData.length - 1].DateTime).toLocaleDateString()}` : 'N/A'}
          </span>
        </div>
      </div>
      <div className="chart-instructions">
        <p>
          <strong>Zoom:</strong> Scroll with mouse wheel | <strong>Pan:</strong> Hold Shift + Drag | <strong>Reset:</strong> Click Reset Zoom button
        </p>
      </div>
    </div>
  );
};

export default ChartComponent;