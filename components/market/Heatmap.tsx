import React, { useState, useMemo } from 'react';
import { CoinMarketData } from '../../types';

type Timeframe = '1h' | '24h' | '7d';

const Heatmap: React.FC<{ data: CoinMarketData[] }> = ({ data }) => {
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');

    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const totalMarketCap = data.reduce((acc, coin) => acc + coin.market_cap, 0);

        return data.map(coin => {
            let change: number | undefined;
            switch (timeframe) {
                case '1h':
                    change = coin.price_change_percentage_1h_in_currency;
                    break;
                case '7d':
                    change = coin.price_change_percentage_7d_in_currency;
                    break;
                case '24h':
                default:
                    change = coin.price_change_percentage_24h;
                    break;
            }

            const percentageOfTotalCap = (coin.market_cap / totalMarketCap) * 100;

            return {
                ...coin,
                change: change ?? 0,
                size: Math.max(0.5, percentageOfTotalCap * 5) // Scale factor for visibility
            };
        }).sort((a, b) => b.market_cap - a.market_cap);

    }, [data, timeframe]);

    const getColor = (change: number) => {
        if (change > 2) return 'bg-green-600 hover:bg-green-500';
        if (change > 0) return 'bg-green-800 hover:bg-green-700';
        if (change < -2) return 'bg-red-600 hover:bg-red-500';
        if (change < 0) return 'bg-red-800 hover:bg-red-700';
        return 'bg-gray-700 hover:bg-gray-600';
    };

    return (
        <div className="bg-primary-dark p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Market Heatmap</h2>
                <div className="flex items-center bg-secondary-dark rounded-lg p-1">
                    {(['1h', '24h', '7d'] as Timeframe[]).map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${timeframe === tf ? 'bg-accent-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            {tf.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-1">
                {processedData.map(coin => (
                    <div
                        key={coin.id}
                        className={`relative group rounded-md p-2 flex flex-col justify-center items-center text-center transition-all duration-300 cursor-pointer ${getColor(coin.change)}`}
                        style={{
                            flexGrow: coin.size,
                            flexBasis: `${coin.size * 2}px`, // Heuristic basis
                            minHeight: '60px',
                        }}
                    >
                        <div className="font-bold text-white text-sm truncate">{coin.symbol.toUpperCase()}</div>
                        <div className="text-xs text-light-gray">{coin.change.toFixed(2)}%</div>
                        <div className="absolute bottom-full mb-2 w-max p-2 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <p className="font-bold">{coin.name}</p>
                            <p>Price: ${coin.current_price.toLocaleString()}</p>
                            <p>Market Cap: ${coin.market_cap.toLocaleString()}</p>
                            <p>Change ({timeframe}): {coin.change.toFixed(2)}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Heatmap;
