import React, { useEffect, useRef, memo } from 'react';

const ForexHeatmap: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Ensure the script is not appended multiple times
        if (!containerRef.current || containerRef.current.hasChildNodes()) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js';
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": "100%",
            "currencies": [
                "EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD", "CNY"
            ],
            "isTransparent": false,
            "colorTheme": "dark",
            "locale": "en",
            "showDescription": true
        });

        containerRef.current.appendChild(script);

    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Forex Heatmap</h1>
            <p className="text-gray-400 max-w-4xl">
                Visualize the strength of major currencies against each other. Green squares indicate the base currency is strengthening against the quote currency, while red indicates weakening. Hover over a square for details.
            </p>
            <div className="bg-primary-dark p-1 rounded-lg h-[70vh]">
                <div ref={containerRef} className="tradingview-widget-container h-full">
                    {/* The TradingView script will populate this div */}
                </div>
            </div>
        </div>
    );
};

export default memo(ForexHeatmap);
