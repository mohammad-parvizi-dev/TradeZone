import React, { useEffect, useRef, memo } from 'react';

interface StrengthWidgetProps {
    symbol: string;
    description: string;
}

const StrengthWidget: React.FC<StrengthWidgetProps> = memo(({ symbol, description }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || containerRef.current.hasChildNodes()) {
            return;
        }

        const script = document.createElement('script');
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = JSON.stringify({
            "interval": "1D",
            "width": "100%",
            "isTransparent": false,
            "height": "100%",
            "symbol": symbol,
            "showIntervalTabs": true,
            "locale": "en",
            "colorTheme": "dark"
        });
        containerRef.current.appendChild(script);
    }, [symbol]);

    return (
        <div className="bg-primary-dark p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">{description} ({symbol.split(':')[1]})</h3>
            <div className="h-96" ref={containerRef}></div>
        </div>
    );
});

const currencies = [
    { symbol: 'TVC:DXY', description: 'US Dollar Index' },
    { symbol: 'TVC:EXY', description: 'Euro Currency Index' },
    { symbol: 'TVC:JXY', description: 'Japanese Yen Currency Index' },
    { symbol: 'TVC:BXY', description: 'British Pound Index' },
    { symbol: 'TVC:AXY', description: 'Australian Dollar Index' },
    { symbol: 'TVC:CXY', description: 'Canadian Dollar Index' },
    { symbol: 'TVC:SXY', description: 'Swiss Franc Index' },
    { symbol: 'TVC:ZXY', description: 'New Zealand Dollar Index' },
];

const ForexCurrencyStrengthMeter: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Currency Strength Meter</h1>
            <p className="text-gray-400 max-w-4xl">
                This dashboard uses the technical analysis of major currency indices as a proxy for individual currency strength. 
                A "Strong Buy" or "Buy" signal suggests strength, while "Strong Sell" or "Sell" suggests weakness.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {currencies.map(currency => (
                    <StrengthWidget key={currency.symbol} symbol={currency.symbol} description={currency.description} />
                ))}
            </div>
        </div>
    );
};

export default ForexCurrencyStrengthMeter;
