import React, { useState, useMemo, useEffect } from 'react';
import DualAxisChart from '../charting/DualAxisChart';
import { InfoIcon } from '../icons';
import SearchableAssetSelector from '../futures/SearchableAssetSelector';
import { popularAssets } from '../../constants';
import { ChartDataPoint } from '../../types';

const popularExchanges = ['Bybit', 'Binance']; // Simplified for demo
const timeRanges = ['1M', '3M', '6M', '1Y'];

// Map for CoinGecko IDs
const assetIdMap: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'XRP': 'ripple',
    'DOGE': 'dogecoin',
    'ADA': 'cardano',
    'BNB': 'binancecoin'
};

const OiVsPriceView: React.FC = () => {
    const [selectedAsset, setSelectedAsset] = useState('BTC');
    const [selectedExchange, setSelectedExchange] = useState('Bybit');
    const [selectedTimeRange, setSelectedTimeRange] = useState('3M');
    
    const [priceData, setPriceData] = useState<ChartDataPoint[]>([]);
    const [oiData, setOiData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedAsset) return;

        const fetchChartData = async () => {
            setLoading(true);
            setError(null);

            const days = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 }[selectedTimeRange] || 90;
            const coinId = assetIdMap[selectedAsset];

            if (!coinId) {
                setError(`CoinGecko ID not found for asset ${selectedAsset}. Cannot fetch price data.`);
                setLoading(false);
                return;
            }

            try {
                // --- API Calls ---
                const pricePromise = fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`)
                    .then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed to fetch price data: ${res.statusText}`)));
                
                const oiSymbol = `${selectedAsset}USDT`;
                const oiPromise = fetch(`https://api.bybit.com/v5/market/open-interest?category=linear&symbol=${oiSymbol}&intervalTime=4h&limit=200`)
                     .then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed to fetch OI data: ${res.statusText}`)));

                const [priceResult, oiResult] = await Promise.all([pricePromise, oiPromise]);

                // --- Data Processing & Syncing ---
                if (!priceResult.prices || !Array.isArray(priceResult.prices)) {
                    throw new Error("Invalid price data from CoinGecko");
                }
                if (oiResult.retCode !== 0 || !Array.isArray(oiResult.result?.list)) {
                    throw new Error(oiResult.retMsg || "Invalid OI data from Bybit");
                }

                const rawPriceData: [number, number][] = priceResult.prices;
                const rawOiData: { openInterest: string; timestamp: string }[] = oiResult.result.list;

                const oiMap = new Map<number, number>();
                rawOiData.forEach(item => {
                    const ts = Math.floor(parseInt(item.timestamp) / 3600000) * 3600000; // Round to nearest hour
                    oiMap.set(ts, parseFloat(item.openInterest));
                });
                
                const syncedPriceData: ChartDataPoint[] = [];
                const syncedOiData: ChartDataPoint[] = [];

                rawPriceData.forEach(([ts, price]) => {
                    const roundedTs = Math.floor(ts / 3600000) * 3600000;
                    if (oiMap.has(roundedTs)) {
                        syncedPriceData.push({ timestamp: ts, value: price });
                        syncedOiData.push({ timestamp: ts, value: oiMap.get(roundedTs)! });
                    }
                });

                if (syncedPriceData.length < 2) {
                     setError("Could not synchronize price and OI data. Try a different asset or timeframe.");
                }

                setPriceData(syncedPriceData);
                setOiData(syncedOiData);

            } catch (err: any) {
                console.error(err);
                setError(err.message);
                setPriceData([]);
                setOiData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();

    }, [selectedAsset, selectedExchange, selectedTimeRange]);

    const allBaseAssets = useMemo(() => Object.keys(assetIdMap), []);

    return (
        <div className="bg-primary-dark p-6 rounded-lg">
            <div className="flex flex-wrap gap-4 items-end mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Asset</label>
                    <SearchableAssetSelector
                        className="w-36"
                        allAssets={allBaseAssets}
                        popularAssets={popularAssets}
                        selectedAsset={selectedAsset}
                        onSelect={setSelectedAsset}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Exchange (OI Source)</label>
                     <select
                        value={selectedExchange}
                        onChange={(e) => setSelectedExchange(e.target.value)}
                        className="bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white w-36"
                    >
                        {popularExchanges.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                </div>
                <div className="flex-grow"></div>
                <div className="flex items-center bg-secondary-dark rounded-lg p-1">
                    {timeRanges.map(range => (
                        <button
                            key={range}
                            onClick={() => setSelectedTimeRange(range)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedTimeRange === range ? 'bg-accent-blue text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-secondary-dark p-4 rounded-lg border border-border-dark">
                <h3 className="text-lg font-semibold text-white mb-2">{`${selectedAsset}/USDT Price (CoinGecko) vs. Open Interest (${selectedExchange})`}</h3>
                {loading && <div className="h-[450px] flex items-center justify-center text-gray-400">Loading and syncing chart data...</div>}
                {error && <div className="h-[450px] flex items-center justify-center text-red-500 text-center"><strong>Error:</strong> {error}</div>}
                {!loading && !error && priceData.length > 1 && (
                     <DualAxisChart priceData={priceData} oiData={oiData} />
                )}
                 {!loading && !error && priceData.length < 2 && (
                    <div className="h-[450px] flex items-center justify-center text-gray-500">Not enough data to display chart.</div>
                )}
            </div>
        </div>
    );
};

export default OiVsPriceView;