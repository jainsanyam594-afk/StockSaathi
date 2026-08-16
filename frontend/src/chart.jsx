import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

function Chart({ symbol, period }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
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

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#128a5e',
      downColor: '#c0392b',
      borderUpColor: '#128a5e',
      borderDownColor: '#c0392b',
      wickUpColor: '#128a5e',
      wickDownColor: '#c0392b',
    });

    fetch(`http://127.0.0.1:8000/history/${symbol}?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
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

    return () => chart.remove();
  }, [symbol, period]);

  return <div ref={chartContainerRef} style={{ width: '100%' }} />;
}

export default Chart;