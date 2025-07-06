import React, { useState, useEffect, useMemo } from 'react';
import FundingRateTable from '../components/futures/FundingRateTable';
import { DerivativeData } from '../types';
import SearchableAssetSelector from '../components/futures/SearchableAssetSelector';
import { popularAssets } from '../constants';

const ALL_EXCHANGES = 'All Exchanges';

const FundingRateTracker: React.FC = () => {
    const [allDerivatives, setAllDerivatives] = useState<DerivativeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
    const [selectedExchanges, setSelectedExchanges] = useState<string[]>([ALL_EXCHANGES]);
    
    // Fetch data periodically to simulate real-time updates
    useEffect(() => {
        const fetchDerivatives = async () => {
            // Only set loading on initial fetch
            if (allDerivatives.length === 0) setLoading(true);
            setError(null);
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/derivatives?include_tickers=unexpired');
                if (!response.ok) {
                    throw new Error(`Failed to fetch derivatives data: ${response.statusText}`);
                }
                const data: DerivativeData[] = await response.json();
                setAllDerivatives(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'An error occurred while fetching data.');
            } finally {
                if (allDerivatives.length === 0) setLoading(false);
            }
        };

        fetchDerivatives();
        const intervalId = setInterval(fetchDerivatives, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, []);

    const exchangeList = useMemo(() => {
        const exchanges = new Set(allDerivatives.map(d => d.market));
        return [ALL_EXCHANGES, ...Array.from(exchanges).sort()];
    }, [allDerivatives]);
    
    const allBaseAssets = useMemo(() => {
        if (!allDerivatives || allDerivatives.length === 0) return popularAssets;
        const baseAssets = new Set<string>();
        const assetRegex = /^([A-Z0-9]+)/;
        const quoteCurrencies = new Set(['USD', 'USDT', 'PERP', 'USDC', 'BUSD']);
        
        allDerivatives.forEach(d => {
            const match = d.symbol.match(assetRegex);
            if(match && match[1]) {
                const potentialAsset = match[1];
                if(!/^\d+$/.test(potentialAsset) && !quoteCurrencies.has(potentialAsset)) {
                     baseAssets.add(potentialAsset);
                }
            }
        });

        popularAssets.forEach(p => baseAssets.add(p));
        
        return Array.from(baseAssets).sort();
   }, [allDerivatives]);


    const handleExchangeChange = (exchange: string) => {
        setSelectedExchanges(prev => {
            if (exchange === ALL_EXCHANGES) {
                return prev.includes(ALL_EXCHANGES) ? [] : [ALL_EXCHANGES];
            }

            const newSelection = prev.filter(e => e !== ALL_EXCHANGES);
            if (newSelection.includes(exchange)) {
                const filtered = newSelection.filter(e => e !== exchange);
                return filtered.length === 0 ? [ALL_EXCHANGES] : filtered;
            } else {
                const updatedSelection = [...newSelection, exchange];
                const allOtherExchanges = exchangeList.filter(e => e !== ALL_EXCHANGES);
                if(updatedSelection.length === allOtherExchanges.length) {
                    return [ALL_EXCHANGES];
                }
                return updatedSelection;
            }
        });
    };
    
    const filteredContracts = useMemo(() => {
        if (allDerivatives.length === 0) return [];

        return allDerivatives.filter(d => {
            const assetMatch = d.symbol.startsWith(selectedAsset);
            const perpetualMatch = d.contract_type === 'perpetual';
            const exchangeMatch = selectedExchanges.includes(ALL_EXCHANGES) || selectedExchanges.includes(d.market);
            
            return assetMatch && perpetualMatch && exchangeMatch;
        });
    }, [allDerivatives, selectedAsset, selectedExchanges]);

    return (
        <div className="bg-primary-dark p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Asset Filter */}
                <div>
                    <label htmlFor="asset-selector" className="block text-sm font-medium text-gray-300 mb-2">
                        Asset Filter
                    </label>
                    <SearchableAssetSelector
                        allAssets={allBaseAssets}
                        popularAssets={popularAssets}
                        selectedAsset={selectedAsset}
                        onSelect={setSelectedAsset}
                        className="w-full"
                    />
                </div>

                {/* Exchange Filter */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Exchange Filter
                    </label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 max-h-24 overflow-y-auto p-2 bg-secondary-dark rounded-lg border border-border-dark">
                        {exchangeList.map(exchange => (
                            <div key={exchange} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`exchange-${exchange}`}
                                    checked={selectedExchanges.includes(exchange)}
                                    onChange={() => handleExchangeChange(exchange)}
                                    className="h-4 w-4 rounded border-gray-600 text-accent-blue bg-gray-700 focus:ring-accent-blue"
                                />
                                <label htmlFor={`exchange-${exchange}`} className="ml-2 text-sm text-gray-300 capitalize">
                                    {exchange.replace(/_/g, ' ')}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {loading && <div className="text-center p-8 text-gray-400">Loading initial data...</div>}
            {error && <div className="text-center p-8 text-red-500">Error: {error}</div>}
            {!loading && !error && (
                <FundingRateTable contracts={filteredContracts} />
            )}
        </div>
    );
};

export default FundingRateTracker;