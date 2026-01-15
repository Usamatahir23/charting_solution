import pandas as pd
import random
from datetime import datetime, timedelta

# Generate OHLCV data (400 candles)
def generate_ohlcv_data(num_candles=400):
    start_date = datetime(2024, 1, 1, 9, 30, 0)
    data = []
    
    base_price = 100.0
    current_price = base_price
    
    for i in range(num_candles):
        timestamp = start_date + timedelta(minutes=i)
        
        # Generate realistic price movement
        change = random.uniform(-0.5, 0.5)
        current_price += change
        
        # Generate OHLC from current price
        high = current_price + random.uniform(0.1, 0.8)
        low = current_price - random.uniform(0.1, 0.8)
        open_price = current_price + random.uniform(-0.3, 0.3)
        close_price = current_price + random.uniform(-0.3, 0.3)
        
        # Ensure High >= max(Open, Close) and Low <= min(Open, Close)
        high = max(high, open_price, close_price)
        low = min(low, open_price, close_price)
        
        volume = random.randint(1000, 5000)
        
        data.append({
            'DateTime': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'Open': round(open_price, 2),
            'High': round(high, 2),
            'Low': round(low, 2),
            'Close': round(close_price, 2),
            'Volume': volume
        })
        
        current_price = close_price
    
    return pd.DataFrame(data)

# Generate trades data (30 trades)
def generate_trades_data(ohlcv_df):
    trades = []
    num_trades = 30
    
    # Get available timestamps
    available_times = ohlcv_df['DateTime'].tolist()
    
    for i in range(num_trades):
        # Pick a random candle for entry
        entry_idx = random.randint(0, len(available_times) - 10)
        entry_time = available_times[entry_idx]
        entry_candle = ohlcv_df.iloc[entry_idx]
        
        # Determine if long or short trade (50/50 chance)
        is_long = random.choice([True, False])
        
        if is_long:
            # Long trade: Entry at or near open, Exit higher, TP above, SL below
            entry_price = entry_candle['Open'] + random.uniform(-0.2, 0.2)
            exit_price = entry_price + random.uniform(0.5, 3.0)
            take_profit = entry_price + random.uniform(2.0, 5.0)
            stop_loss = entry_price - random.uniform(1.0, 2.5)
            reason = random.choice(['Take Profit', 'Take Profit', 'Stop Loss'])
        else:
            # Short trade: Entry at or near open, Exit lower, TP below, SL above
            entry_price = entry_candle['Open'] + random.uniform(-0.2, 0.2)
            exit_price = entry_price - random.uniform(0.5, 3.0)
            take_profit = entry_price - random.uniform(2.0, 5.0)
            stop_loss = entry_price + random.uniform(1.0, 2.5)
            reason = random.choice(['Take Profit', 'Take Profit', 'Stop Loss'])
        
        # Exit time is after entry
        exit_idx = min(entry_idx + random.randint(1, 10), len(available_times) - 1)
        exit_time = available_times[exit_idx]
        
        trades.append({
            'DateTime': entry_time,
            'Entry': round(entry_price, 2),
            'Exit': round(exit_price, 2),
            'TakeProfit': round(take_profit, 2),
            'StopLoss': round(stop_loss, 2),
            'Reason': reason
        })
    
    # Sort by DateTime
    trades_df = pd.DataFrame(trades)
    trades_df = trades_df.sort_values('DateTime')
    return trades_df

# Generate and save data
print("Generating OHLCV data...")
ohlcv_df = generate_ohlcv_data(400)
ohlcv_df.to_csv('sample_ohlcv.csv', index=False)
print(f"Generated {len(ohlcv_df)} OHLCV candles")

print("Generating trades data...")
trades_df = generate_trades_data(ohlcv_df)
trades_df.to_csv('sample_trades.csv', index=False)
print(f"Generated {len(trades_df)} trades")

print("Sample data files created successfully!")
print(f"OHLCV file: sample_ohlcv.csv ({len(ohlcv_df)} rows)")
print(f"Trades file: sample_trades.csv ({len(trades_df)} rows)")
