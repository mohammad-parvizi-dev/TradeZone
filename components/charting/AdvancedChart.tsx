
import React, { useEffect, useRef } from 'react';
import { SelectedCoin } from '../../types';

declare const TradingView: any;

interface AdvancedChartProps {
  selectedCoin: SelectedCoin;
}

const exchangeMap: { [key: string]: string } = {
    'binance_futures': 'BINANCE',
    'bybit': 'BYBIT',
    'okx_swap': 'OKX',
    'kraken_futures': 'KRAKEN',
    'kucoin_futures': 'KUCOIN',
    'gate_io_futures': 'GATEIO',
    // Default to uppercase if not in map
};


const AdvancedChart: React.FC<AdvancedChartProps> = ({ selectedCoin }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || typeof TradingView === 'undefined' || !selectedCoin) {
      return;
    }

    const tvSymbol = selectedCoin.exchange 
      ? `${exchangeMap[selectedCoin.exchange] || selectedCoin.exchange.toUpperCase()}:${selectedCoin.symbol}`
      : `COINBASE:${selectedCoin.symbol}USD`;

    const widgetOptions = {
      autosize: true,
      symbol: tvSymbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#131316',
      enable_publishing: false,
      allow_symbol_change: true,
      withdateranges: true,
      hide_side_toolbar: false,
      details: true,
      hotlist: true,
      calendar: true,
      container_id: containerRef.current.id,
    };

    // Create the widget
    const widget = new TradingView.widget(widgetOptions);
    widgetRef.current = widget;

    // Add a cleanup function to be called on unmount or when dependencies change
    return () => {
        if(widgetRef.current) {
            try {
                widgetRef.current.remove();
            } catch (e) {
                console.warn("Error removing TradingView widget on unmount:", e);
            }
            widgetRef.current = null;
        }
    }

  }, [selectedCoin]); // Re-run effect when selectedCoin changes

  const containerId = `tradingview-widget-container-${selectedCoin.exchange || 'spot'}-${selectedCoin.symbol}`;

  return (
    // By giving the div a key that changes with the coin, we ensure that React
    // fully unmounts the old component and mounts a new one, which helps
    // the TradingView widget re-initialize cleanly.
    <div key={containerId} id={containerId} ref={containerRef} className="h-[70vh] w-full" />
  );
};

export default AdvancedChart;
