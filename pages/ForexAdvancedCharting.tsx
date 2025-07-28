
import React, { useEffect, useRef } from 'react';

declare const TradingView: any;

interface ForexAdvancedChartingProps {
  selectedForexPair: string | null;
  setActiveItemId: (id: string) => void;
}

const ForexAdvancedCharting: React.FC<ForexAdvancedChartingProps> = ({ selectedForexPair, setActiveItemId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<any>(null);

  useEffect(() => {
    // If there's no selected pair or the container isn't rendered yet, do nothing.
    if (!selectedForexPair || !containerRef.current) {
      return;
    }

    const widgetOptions = {
      autosize: true,
      symbol: `FX:${selectedForexPair}`,
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

    // Create the new widget and store its instance
    const widget = new TradingView.widget(widgetOptions);
    widgetInstanceRef.current = widget;

    // The cleanup function is critical. It runs when the component unmounts or the `selectedForexPair` changes.
    return () => {
      if (widgetInstanceRef.current !== null) {
        try {
          // The widget's remove() method can throw an error if the component
          // unmounts and React removes the container from the DOM before this cleanup runs.
          // Wrapping it in a try-catch prevents the entire application from crashing.
          widgetInstanceRef.current.remove();
        } catch (error) {
          console.warn("Error removing TradingView widget during unmount:", error);
        }
        widgetInstanceRef.current = null;
      }
    };
  }, [selectedForexPair]); // This effect re-runs only when the forex pair changes.

  // If no pair is selected, show a prompt to the user
  if (!selectedForexPair) {
    return (
      <div className="bg-primary-dark p-8 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Full Analytical Chart</h2>
        <p className="text-gray-400 mb-6">Please select a currency pair from the Rates Table to view its chart.</p>
        <button
          onClick={() => setActiveItemId('forex-rates-table')}
          className="bg-accent-blue text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Rates Table
        </button>
      </div>
    );
  }
  
  // Use a static ID for the container to avoid race conditions during re-renders.
  const containerId = "tradingview-forex-widget-container";
  const displayPair = selectedForexPair.length > 4 ? `${selectedForexPair.slice(0, 3)}/${selectedForexPair.slice(3)}` : selectedForexPair;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-6">
        Full Analytical Chart: {displayPair}
      </h1>
      {/* The widget will be mounted inside this div */}
      <div id={containerId} ref={containerRef} className="h-[70vh] w-full" />
    </div>
  );
};

export default ForexAdvancedCharting;
