
import React, { useState, useEffect } from 'react';
import { DexPool, SelectedCoin } from '../types';
import TrendingPools from '../components/dex/MostActivePools';
import PairSearch from '../components/dex/PairSearch';
import PoolAnalysis from '../components/dex/PoolAnalysis';
import { ListIcon, SearchIcon } from '../components/icons';
import { fetchWithCache } from '../utils/api';

type ActiveView = 'list' | 'analysis';
type ActiveTab = 'trending' | 'search';

interface DefiLlamaPool {
    pool: string;
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy?: number;
}

const TabButton: React.FC<{
    label: string;
    tabName: ActiveTab;
    Icon: React.ComponentType<{ className?: string }>;
    activeTab: ActiveTab;
    onClick: (tabName: ActiveTab) => void;
}> = ({ label, tabName, Icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2
            ${activeTab === tabName
                ? 'text-white border-accent-blue'
                : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

interface PoolsAndPairsAnalysisProps {
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin | null) => void;
}

const PoolsAndPairsAnalysis: React.FC<PoolsAndPairsAnalysisProps> = ({ setActiveItemId, setSelectedCoin }) => {
    const [view, setView] = useState<ActiveView>('list');
    const [activeTab, setActiveTab] = useState<ActiveTab>('trending');
    const [selectedPool, setSelectedPool] = useState<DexPool | null>(null);

    const [allPools, setAllPools] = useState<DexPool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPools = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apiResponse = await fetchWithCache<{ data: DefiLlamaPool[] }>('llama-yield-pools', 'https://yields.llama.fi/pools', 600);

                if (!apiResponse || !Array.isArray(apiResponse.data)) {
                    throw new Error("Invalid data structure from DefiLlama pools API");
                }

                const mappedPools: DexPool[] = apiResponse.data
                    .filter(p => p.tvlUsd > 1000 && p.symbol.includes('-')) // Filter small pools and ensure it's a pair
                    .map(p => ({
                        id: p.pool,
                        pairName: p.symbol,
                        dex: p.project.charAt(0).toUpperCase() + p.project.slice(1).replace(/-/g, ' '),
                        dexSlug: p.project,
                        chain: p.chain,
                        tvl: p.tvlUsd,
                        apy: p.apy,
                    }));
                
                setAllPools(mappedPools);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPools();
    }, []);

    const handlePoolSelect = (pool: DexPool) => {
        setSelectedPool(pool);
        setView('analysis');
    };

    const handleBackToList = () => {
        setSelectedPool(null);
        setView('list');
    };

    if (view === 'analysis' && selectedPool) {
        return <PoolAnalysis pool={selectedPool} onBack={handleBackToList} />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Pools & Pairs Analysis</h1>
            
            <div className="border-b border-border-dark">
                <div className="flex items-center space-x-2">
                    <TabButton 
                        label="Top Pools by TVL"
                        tabName="trending"
                        Icon={ListIcon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                    <TabButton 
                        label="Pair Search"
                        tabName="search"
                        Icon={SearchIcon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                </div>
            </div>

            <div className="mt-4">
                {activeTab === 'trending' && (
                    <TrendingPools 
                        pools={allPools} 
                        isLoading={isLoading} 
                        error={error} 
                        onPoolSelect={handlePoolSelect} 
                    />
                )}
                {activeTab === 'search' && (
                    <PairSearch 
                        allPools={allPools} 
                        isLoading={isLoading} 
                        error={error} 
                        onPoolSelect={handlePoolSelect} 
                    />
                )}
            </div>
        </div>
    );
};

export default PoolsAndPairsAnalysis;
