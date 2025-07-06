import React from 'react';
import { CoinMarketData } from '../../types';

interface TickerTapeProps {
    data: CoinMarketData[];
}

const TickerItem: React.FC<{ item: CoinMarketData }> = ({ item }) => {
    const priceChange = item.price_change_percentage_24h;
    const isPositive = priceChange >= 0;

    return (
        <div className="flex items-center space-x-4 mx-6 flex-shrink-0 cursor-pointer group">
            <img src={item.image} alt={item.name} className="w-6 h-6" />
            <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-sm text-light-gray group-hover:text-white">{item.symbol.toUpperCase()}/USD</span>
                <span className="font-mono text-sm text-gray-400">${item.current_price.toLocaleString()}</span>
            </div>
            <span className={`font-mono text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
        </div>
    );
};

const TickerTape: React.FC<TickerTapeProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return null;
    }

    const duplicatedData = [...data, ...data];

    return (
        <div className="bg-primary-dark w-full overflow-hidden py-3 border-y border-border-dark">
            <style>
                {`
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 60s linear infinite;
                }
                .group:hover .animate-scroll {
                    animation-play-state: paused;
                }
                `}
            </style>
            <div className="group">
                <div className="flex animate-scroll">
                    {duplicatedData.map((item, index) => (
                        <TickerItem key={`${item.id}-${index}`} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TickerTape;
