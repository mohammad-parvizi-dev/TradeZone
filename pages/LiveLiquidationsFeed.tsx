import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LiquidationEvent } from '../types';
import { PlayIcon, PauseIcon } from '../components/icons';

const MOCK_ASSETS = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'BNB', 'AVAX', 'LINK', 'MATIC'];
const MOCK_EXCHANGES = ['Binance', 'Bybit', 'OKX', 'dYdX', 'KuCoin'];
const MIN_SIZE_PRESETS = [10000, 100000, 1000000];

const generateMockLiquidation = (): LiquidationEvent => {
    const asset = MOCK_ASSETS[Math.floor(Math.random() * MOCK_ASSETS.length)];
    const price = asset === 'BTC' ? 60000 + (Math.random() - 0.5) * 5000 : asset === 'ETH' ? 3000 + (Math.random() - 0.5) * 500 : 150 + (Math.random() - 0.5) * 50;
    
    return {
        id: `liq-${Date.now()}-${Math.random()}`,
        exchange: MOCK_EXCHANGES[Math.floor(Math.random() * MOCK_EXCHANGES.length)],
        pair: `${asset}/USDT`,
        side: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        price: parseFloat(price.toFixed(2)),
        quantityUSD: Math.floor(Math.random() * (2000000 - 5000 + 1)) + 5000,
        timestamp: Date.now(),
    };
};

const getExchangeLogo = (exchangeName: string) => {
    const name = exchangeName.toLowerCase();
    const cdnUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@main/32/color/${name}.png`;
    // A generic fallback for exchanges not in the icon pack
    const fallbackUrl = 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/1.png'; 
    return cdnUrl;
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const LiveLiquidationsFeed: React.FC = () => {
    const [liquidations, setLiquidations] = useState<LiquidationEvent[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [assetFilter, setAssetFilter] = useState('');
    const [minSize, setMinSize] = useState(100000);
    const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
    const [newItems, setNewItems] = useState<Set<string>>(new Set());
    const intervalRef = useRef<number | null>(null);

    const handleNewLiquidation = useCallback(() => {
        const newLiq = generateMockLiquidation();
        setNewItems(prev => new Set(prev).add(newLiq.id));
        setLiquidations(prev => [newLiq, ...prev.slice(0, 99)]);
        
        setTimeout(() => {
            setNewItems(prev => {
                const next = new Set(prev);
                next.delete(newLiq.id);
                return next;
            });
        }, 1000); // Animation duration
    }, []);

    useEffect(() => {
        if (!isPaused) {
            handleNewLiquidation(); // Add one immediately on play
            intervalRef.current = window.setInterval(handleNewLiquidation, Math.random() * 2000 + 1000); // Random interval
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPaused, handleNewLiquidation]);
    
    const handleExchangeToggle = (exchange: string) => {
        setSelectedExchanges(prev => 
            prev.includes(exchange) 
                ? prev.filter(e => e !== exchange) 
                : [...prev, exchange]
        );
    };

    const filteredLiquidations = useMemo(() => {
        return liquidations.filter(liq => {
            if (minSize > 0 && liq.quantityUSD < minSize) return false;

            const assets = assetFilter.split(',').map(a => a.trim().toUpperCase()).filter(Boolean);
            if (assets.length > 0 && !assets.includes(liq.pair.split('/')[0])) return false;

            if (selectedExchanges.length > 0 && !selectedExchanges.includes(liq.exchange)) return false;
            
            return true;
        });
    }, [liquidations, minSize, assetFilter, selectedExchanges]);

    return (
        <div className="space-y-6">
            <style>
                {`
                @keyframes new-item-flash {
                  from { background-color: rgba(37, 99, 235, 0.3); }
                  to { background-color: transparent; }
                }
                .animate-new-item {
                  animation: new-item-flash 1s ease-out;
                }
                `}
            </style>
            <h1 className="text-2xl font-semibold text-white">Live Liquidations Feed</h1>
            
            <div className="bg-primary-dark p-6 rounded-lg space-y-6">
                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Asset Filter (e.g. BTC,ETH)</label>
                        <input
                            type="text"
                            placeholder="All Assets"
                            value={assetFilter}
                            onChange={(e) => setAssetFilter(e.target.value)}
                            className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Size (USD)</label>
                        <div className="flex items-center gap-2">
                             <input
                                type="number"
                                placeholder="e.g., 100000"
                                value={minSize}
                                onChange={(e) => setMinSize(Number(e.target.value))}
                                className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                            />
                        </div>
                         <div className="flex items-center gap-2 mt-2">
                            {MIN_SIZE_PRESETS.map(preset => (
                                <button key={preset} onClick={() => setMinSize(preset)} className={`text-xs px-2 py-1 rounded ${minSize === preset ? 'bg-accent-blue text-white' : 'bg-secondary-dark text-gray-300 hover:bg-gray-700'}`}>
                                    &gt;{formatCurrency(preset).replace(/\.00$/, '')}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Exchange Filter</label>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {MOCK_EXCHANGES.map(exchange => (
                                <div key={exchange} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`exchange-${exchange}`}
                                        checked={selectedExchanges.includes(exchange)}
                                        onChange={() => handleExchangeToggle(exchange)}
                                        className="h-4 w-4 rounded border-gray-600 text-accent-blue bg-gray-700 focus:ring-accent-blue"
                                    />
                                    <label htmlFor={`exchange-${exchange}`} className="ml-2 text-sm text-gray-300">{exchange}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-3 h-[60vh] overflow-y-auto pr-2">
                    <div className="sticky top-0 bg-primary-dark py-2 z-10 flex items-center justify-between border-b border-border-dark">
                         <div className="grid grid-cols-12 gap-4 w-full text-xs text-gray-400 uppercase font-medium px-4">
                            <div className="col-span-3">Pair / Exchange</div>
                            <div className="col-span-2 text-center">Side</div>
                            <div className="col-span-3 text-right">Size (USD)</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right">Time</div>
                        </div>
                        <button onClick={() => setIsPaused(!isPaused)} className="ml-4 p-2 bg-secondary-dark rounded-full text-white hover:bg-gray-700">
                            {isPaused ? <PlayIcon className="w-5 h-5"/> : <PauseIcon className="w-5 h-5"/>}
                        </button>
                    </div>

                    {filteredLiquidations.map(liq => (
                        <div key={liq.id} className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg bg-secondary-dark border-l-4 ${liq.side === 'LONG' ? 'border-red-500' : 'border-green-500'} ${newItems.has(liq.id) ? 'animate-new-item' : ''}`}>
                            <div className="col-span-3 flex items-center">
                                <img src={getExchangeLogo(liq.exchange)} onError={(e) => { e.currentTarget.src = 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/1.png'; e.currentTarget.onerror = null; }} alt={liq.exchange} className="w-6 h-6 mr-3 rounded-full"/>
                                <div>
                                    <div className="font-bold text-white">{liq.pair}</div>
                                    <div className="text-xs text-gray-400">{liq.exchange}</div>
                                </div>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${liq.side === 'LONG' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {liq.side === 'LONG' ? 'LONG LIQ' : 'SHORT LIQ'}
                                </span>
                            </div>
                            <div className="col-span-3 text-right font-mono text-lg font-semibold text-white">
                                {formatCurrency(liq.quantityUSD)}
                            </div>
                            <div className="col-span-2 text-right font-mono text-white">
                                @ {liq.price.toLocaleString()}
                            </div>
                            <div className="col-span-2 text-right font-mono text-sm text-gray-500">
                                {new Date(liq.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                    {filteredLiquidations.length === 0 && (
                        <div className="text-center py-16 text-gray-500">
                            {isPaused ? 'Feed is paused.' : 'Waiting for liquidations matching your filters...'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveLiquidationsFeed;
