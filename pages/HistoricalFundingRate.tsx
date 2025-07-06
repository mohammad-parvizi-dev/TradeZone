import React, { useState, useMemo, useEffect } from 'react';
import LineChart from '../components/charting/LineChart';
import { InfoIcon } from '../components/icons';
import SearchableAssetSelector from '../components/futures/SearchableAssetSelector';
import { popularAssets } from '../constants';
import { DerivativeData, ChartDataPoint } from '../types';

const timeRanges = ['1W', '1M', '3M', 'ALL'];

const HistoricalFundingRate: React.FC = () => {
    const [selectedAsset, setSelectedAsset] = useState('BTC');
    const [selectedTimeRange, setSelectedTimeRange] = useState('3M');
    const [allDerivatives, setAllDerivatives] = useState<DerivativeData[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all assets for the dropdown
    useEffect(() => {
        const fetchAllAssets = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/derivatives');
                if (!response.ok) throw new Error('Failed to fetch derivatives data');
                const data: DerivativeData[] = await response.json();
                setAllDerivatives(data);
            } catch (err: any) { console.error(err); }
        };
        fetchAllAssets();
    }, []);

    // Fetch historical data when asset changes
    useEffect(() => {
        if (!selectedAsset) return;

        const fetchFundingHistory = async () => {
            setLoading(true);
            setError(null);
            setChartData([]);
            try {
                const symbol = `${selectedAsset}USDT`;
                const url = `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=200`;
                const response = await fetch(url);
                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(errorBody.retMsg || `Failed to fetch funding history for ${symbol}`);
                }
                const result = await response.json();
                if (result.retCode !== 0 || !Array.isArray(result.result?.list)) {
                    throw new Error(result.retMsg || "Invalid data structure from Bybit API.");
                }

                const data: ChartDataPoint[] = result.result.list
                    .map((item: { fundingRate: string, fundingTime: string }) => ({
                        timestamp: parseInt(item.fundingTime),
                        value: parseFloat(item.fundingRate) * 100, // as percentage
                    }))
                    .reverse(); // API returns newest first, chart needs oldest first

                setChartData(data);

            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFundingHistory();

    }, [selectedAsset]);

    const allBaseAssets = useMemo(() => {
        if (!allDerivatives || allDerivatives.length === 0) return popularAssets;
        const baseAssets = new Set<string>(popularAssets);
        const assetRegex = /^([A-Z0-9]+)/;
        allDerivatives.forEach(d => {
            const match = d.symbol.match(assetRegex);
            if (match && match[1] && !/^\d+$/.test(match[1])) {
                baseAssets.add(match[1]);
            }
        });
        return Array.from(baseAssets).sort();
   }, [allDerivatives]);
   
    const filteredChartData = useMemo(() => {
        if (selectedTimeRange === 'ALL' || chartData.length === 0) return chartData;
        const days = {'1W': 7, '1M': 30, '3M': 90}[selectedTimeRange] ?? 90;
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        return chartData.filter(d => d.timestamp >= cutoff);
    }, [chartData, selectedTimeRange]);


    return (
        <div className="bg-primary-dark p-6 rounded-lg">
            <div className="flex flex-wrap gap-4 items-end mb-6">
                {/* Asset Selector */}
                <div>
                    <label htmlFor="asset-selector-hist" className="block text-sm font-medium text-gray-300 mb-1">Asset</label>
                    <SearchableAssetSelector
                        className="w-full"
                        allAssets={allBaseAssets}
                        popularAssets={popularAssets}
                        selectedAsset={selectedAsset}
                        onSelect={setSelectedAsset}
                    />
                </div>

                {/* Time Range Selector */}
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
                 <h3 className="text-lg font-semibold text-white mb-2">{`${selectedAsset}/USDT Funding Rate History (from Bybit)`}</h3>
                {loading && <div className="h-[400px] flex items-center justify-center text-gray-400">Loading historical funding data...</div>}
                {error && <div className="h-[400px] flex items-center justify-center text-red-500">Error: {error}</div>}
                {!loading && !error && filteredChartData.length > 0 && <LineChart data={filteredChartData} height={400} />}
                {!loading && !error && filteredChartData.length === 0 && <div className="h-[400px] flex items-center justify-center text-gray-500">No historical funding data available for this asset on Bybit.</div>}
            </div>
        </div>
    );
};

export default HistoricalFundingRate;