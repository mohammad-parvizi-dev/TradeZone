
import React, { useEffect, useRef, memo } from 'react';

const EconomicCalendar: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || containerRef.current.hasChildNodes()) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": "100%",
            "colorTheme": "dark",
            "isTransparent": false,
            "locale": "en",
            "importanceFilter": "-1,0,1",
            "currencyFilter": "USD,EUR,JPY,GBP,CHF,AUD,CAD,NZD,CNY"
        });

        containerRef.current.appendChild(script);
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Economic Calendar</h1>
            <p className="text-gray-400 max-w-4xl">
                Stay ahead of market-moving events. This calendar provides key economic indicators, release times, and their potential impact on currency markets. You can filter by importance and country.
            </p>
            <div className="bg-primary-dark p-1 rounded-lg h-[75vh]">
                <div ref={containerRef} className="tradingview-widget-container h-full">
                    {/* The TradingView script will populate this div */}
                </div>
            </div>
        </div>
    );
};

export default memo(EconomicCalendar);
