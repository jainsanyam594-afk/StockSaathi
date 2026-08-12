import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

function Chart({ symbol }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    // Create the chart inside our container div
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#FEFDF9' },
        textColor: '#5A6960',
      },
      grid: {
        vertLines: { color: 'rgba(14,26,20,0.05)' },
        horzLines: { color: 'rgba(14,26,20,0.05)' },
      },
    });

    // Add a candlestick series with our brand colors
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#128a5e',
      downColor: '#c0392b',
      borderUpColor: '#128a5e',
      borderDownColor: '#c0392b',
      wickUpColor: '#128a5e',
      wickDownColor: '#c0392b',
    });

    // Fetch the historical data from our backend
    fetch(`http://127.0.0.1:8000/history/${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        // Convert our candles into the format the chart needs
        const formatted = data.candles.map((c) => ({
          time: c.date,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        candleSeries.setData(formatted);
        chart.timeScale().fitContent();
      })
      .catch((err) => console.log('Chart error:', err));

    // Cleanup: remove the chart when symbol changes or component unmounts
    return () => chart.remove();
  }, [symbol]);

  return <div ref={chartContainerRef} style={{ width: '100%' }} />;
}

export default Chart;