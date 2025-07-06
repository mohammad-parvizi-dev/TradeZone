import React, { useState, useEffect, useMemo } from 'react';
import { SelectedCoin, DerivativeData } from '../types';
import ContractsComparisonTable from '../components/futures/ContractsComparisonTable';
import SearchableAssetSelector from '../components/futures/SearchableAssetSelector';
import { popularAssets } from '../constants';

const FuturesDashboard: React.FC<{
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin) => void;
}> = ({ setActiveItemId, setSelectedCoin }) => {
    const [allDerivatives, setAllDerivatives] = useState<DerivativeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<string>('BTC');

    useEffect(() => {
        const fetchDerivatives = async () => {
            setLoading(true);
            setError(null);
            try {
                // In a real app, this would be a backend call aggregating data.
                // We use CoinGecko's derivatives endpoint as a proxy.
                const response = await fetch('https://api.coingecko.com/api/v3/derivatives');
                if (!response.ok) {
                    throw new Error(`Failed to fetch derivatives data: ${response.statusText}`);
                }
                const data: DerivativeData[] = await response.json();
                setAllDerivatives(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'An error occurred while fetching data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDerivatives();
    }, []);

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

    const filteredContracts = useMemo(() => {
        if (!selectedAsset || allDerivatives.length === 0) {
            return [];
        }
        // Filter for perpetual USDT contracts for the selected asset
        return allDerivatives.filter(d =>
            d.contract_type === 'perpetual' &&
            d.symbol.startsWith(selectedAsset) &&
            (d.symbol.endsWith('USDT') || d.symbol.endsWith('PERP'))
        ).sort((a, b) => (b.volume_24h ?? 0) - (a.volume_24h ?? 0)); // Sort by volume
    }, [allDerivatives, selectedAsset]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Futures Contracts Comparison</h1>

            <div className="bg-primary-dark p-6 rounded-lg">
                <div className="flex items-center gap-4 mb-6">
                    <label className="text-lg font-medium text-gray-300">
                        Asset:
                    </label>
                    <SearchableAssetSelector
                        className="w-48"
                        allAssets={allBaseAssets}
                        popularAssets={popularAssets}
                        selectedAsset={selectedAsset}
                        onSelect={setSelectedAsset}
                    />
                </div>

                {loading && <div className="text-center p-8 text-gray-400">Loading contracts data...</div>}
                {error && <div className="text-center p-8 text-red-500">Error: {error}</div>}
                {!loading && !error && (
                    <ContractsComparisonTable
                        contracts={filteredContracts}
                        setActiveItemId={setActiveItemId}
                        setSelectedCoin={setSelectedCoin}
                    />
                )}
            </div>
        </div>
    );
};

export default FuturesDashboard;