import React, { useState, useMemo, useEffect } from 'react';
import DualAxisChart from '../components/charting/DualAxisChart';
import { InfoIcon } from '../components/icons';
import SearchableAssetSelector from '../components/futures/SearchableAssetSelector';
import { popularAssets } from '../constants';
import { DerivativeData } from '../types';

const popularExchanges = ['Bybit', 'Binance', 'OKX', 'dYdX', 'Kraken', 'KuCoin'];
const timeRanges = ['1M', '3M', '6M', '1Y', 'ALL'];

// Generate mock data for demonstration
const generateMockChartData = (days: number, startPrice: number, startOi: number) => {
    const priceData = [];
    const oiData = [];
    const now = new Date();
    let price = startPrice;
    let oi = startOi;

    for (let i = days; i > 0; i--) {
        const timestamp = new Date(now).setDate(now.getDate() - i);
        
        // Simulate price and OI movements
        price *= (1 + (Math.random() - 0.49) * 0.05);
        oi *= (1 + (Math.random() - 0.5) * 0.06);

        priceData.push({ timestamp, value: price });
        oiData.push({ timestamp, value: oi });
    }
    return { priceData, oiData };
};

const OiVsPriceChart: React.FC = () => {
    const [selectedAsset, setSelectedAsset] = useState('BTC');
    const [selectedExchange, setSelectedExchange] = useState('Bybit');
    const [selectedTimeRange, setSelectedTimeRange] = useState('3M');
    const [allDerivatives, setAllDerivatives] = useState<DerivativeData[]>([]);

    useEffect(() => {
        const fetchDerivatives = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/derivatives');
                if (!response.ok) throw new Error('Failed to fetch derivatives data');
                setAllDerivatives(await response.json());
            } catch (err) { console.error(err); }
        };
        fetchDerivatives();
    }, []);

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

    const mockData = useMemo(() => {
        const days = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': 500 }[selectedTimeRange] || 90;
        const startPrice = selectedAsset === 'BTC' ? 60000 : selectedAsset === 'ETH' ? 3000 : 150;
        const startOi = selectedAsset === 'BTC' ? 15e9 : selectedAsset === 'ETH' ? 8e9 : 1e9;
        return generateMockChartData(days, startPrice, startOi);
    }, [selectedTimeRange, selectedAsset, selectedExchange]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Open Interest vs. Price</h1>

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
                        <label className="block text-sm font-medium text-gray-300 mb-1">Exchange</label>
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
                    <div className="flex items-center gap-2 text-amber-400 bg-amber-900/20 border border-amber-600/30 rounded-md p-3 mb-4">
                        <InfoIcon tooltip="" className="w-6 h-6 flex-shrink-0" />
                        <p className="text-sm">
                            <strong>Note:</strong> Historical Open Interest data requires a dedicated API which is not available in this demo. The chart below is rendered with mock data for visual representation.
                        </p>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{`${selectedAsset}/USDT Price vs. Open Interest on ${selectedExchange}`}</h3>
                    <DualAxisChart priceData={mockData.priceData} oiData={mockData.oiData} />
                </div>
            </div>
        </div>
    );
};

export default OiVsPriceChart;
