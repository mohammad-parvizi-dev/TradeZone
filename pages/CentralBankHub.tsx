import React, { useEffect, useRef, memo } from 'react';

const CentralBankHub: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Ensure the script is not appended multiple times if the component re-renders.
        if (!containerRef.current || containerRef.current.hasChildNodes()) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
        script.async = true;
        script.type = 'text/javascript';
        
        // Settings for the TradingView Economic Calendar widget
        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": "100%",
            "colorTheme": "dark",
            "isTransparent": false,
            "locale": "en",
            "importanceFilter": "0,1", // Focus on medium and high importance events relevant to central banks
            "currencyFilter": "USD,EUR,JPY,GBP,CHF,AUD,CAD,NZD,CNY"
        });

        containerRef.current.appendChild(script);

    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Central Bank Hub - Economic Calendar</h1>
            <p className="text-gray-400 max-w-4xl">
                Track key economic events and central bank announcements that drive currency markets. This interactive calendar provides real-time data on interest rate decisions, inflation reports, and other market-moving indicators.
            </p>
            <div className="bg-primary-dark p-1 rounded-lg h-[75vh]">
                <div ref={containerRef} className="tradingview-widget-container h-full">
                    {/* The TradingView Economic Calendar widget will be embedded here. */}
                </div>
            </div>
        </div>
    );
};

export default memo(CentralBankHub);