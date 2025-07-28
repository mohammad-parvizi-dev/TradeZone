import React, { useEffect, useRef, memo } from 'react';

const ForexPerformanceLeaders: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || containerRef.current.hasChildNodes()) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": "100%",
            "defaultColumn": "overview",
            "screener_type": "forex",
            "displayCurrency": "USD",
            "colorTheme": "dark",
            "locale": "en",
            "isTransparent": false
        });

        containerRef.current.appendChild(script);

    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Forex Performance Leaders</h1>
            <p className="text-gray-400 max-w-4xl">
                A real-time view of the foreign exchange market's top gainers and losers. The widget below provides sortable columns and tabs to switch between performance categories.
            </p>
            <div className="bg-primary-dark p-1 rounded-lg h-[75vh]">
                <div ref={containerRef} className="tradingview-widget-container h-full">
                    {/* The TradingView script will populate this div */}
                </div>
            </div>
        </div>
    );
};

export default memo(ForexPerformanceLeaders);
