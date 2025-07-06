import React, { useState, useEffect, useMemo } from 'react';
import { DexPool } from '../../types';

const formatLargeNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

interface PairSearchProps {
    allPools: DexPool[];
    isLoading: boolean;
    error: string | null;
    onPoolSelect: (pool: DexPool) => void;
}

const PairSearch: React.FC<PairSearchProps> = ({ allPools, isLoading, error, onPoolSelect }) => {
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    
    // Debounced search terms
    const [debouncedTokenA, setDebouncedTokenA] = useState('');
    const [debouncedTokenB, setDebouncedTokenB] = useState('');

    // Debounce effect
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTokenA(tokenA);
            setDebouncedTokenB(tokenB);
        }, 300); // 300ms delay

        // Cleanup function to clear the timeout if the user types again
        return () => {
            clearTimeout(handler);
        };
    }, [tokenA, tokenB]);

    // Memoized search results
    const searchResults = useMemo(() => {
        if (!debouncedTokenA && !debouncedTokenB) {
            return [];
        }
        
        const termA = debouncedTokenA.toLowerCase().trim();
        const termB = debouncedTokenB.toLowerCase().trim();

        if (!termA && !termB) {
            return [];
        }

        return allPools.filter(pool => {
            const symbols = pool.pairName.toLowerCase().split(/[-/]/).map(s => s.trim());
            
            if (termA && termB) {
                return (symbols.includes(termA) && symbols.includes(termB)) || (symbols.includes(termB) && symbols.includes(termA));
            }
            
            // If only one token is entered
            return symbols.includes(termA) || symbols.includes(termB);
        }).sort((a,b) => b.tvl - a.tvl); // Sort results by liquidity

    }, [allPools, debouncedTokenA, debouncedTokenB]);
    
    if (isLoading) return <div className="text-center p-8 text-gray-400">Loading pool data for search...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="bg-primary-dark p-6 rounded-lg space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Token A</label>
                    <input
                        type="text"
                        placeholder="e.g., WETH"
                        value={tokenA}
                        onChange={(e) => setTokenA(e.target.value)}
                        className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Token B (optional)</label>
                    <input
                        type="text"
                        placeholder="e.g., USDC"
                        value={tokenB}
                        onChange={(e) => setTokenB(e.target.value)}
                        className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                    />
                </div>
            </div>
            
            {(debouncedTokenA || debouncedTokenB) && (
                <div className="overflow-x-auto">
                    <h3 className="text-lg font-semibold text-white mb-4">Search Results ({searchResults.length})</h3>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="min-w-full divide-y divide-border-dark">
                             <thead className="sticky top-0 bg-primary-dark">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/3">Pool</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">DEX</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Chain</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Liquidity (TVL)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">APY</th>
                                </tr>
                            </thead>
                             <tbody className="bg-primary-dark divide-y divide-border-dark">
                                {searchResults.length > 0 ? searchResults.map((pool) => (
                                    <tr key={pool.id} onClick={() => onPoolSelect(pool)} className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer">
                                         <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="font-medium text-white">{pool.pairName}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{pool.dex}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{pool.chain}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatLargeNumber(pool.tvl)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{pool.apy != null ? `${pool.apy.toFixed(2)}%` : 'N/A'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">No pools found for this pair.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!(debouncedTokenA || debouncedTokenB) && (
                 <div className="text-center py-16 text-gray-500">
                    Enter a token symbol above to start searching for liquidity pools.
                </div>
            )}
        </div>
    );
};

export default PairSearch;