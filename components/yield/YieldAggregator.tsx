
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { YieldPool } from '../../types';
import { SearchIcon, ArrowUpIcon, ArrowDownIcon } from '../icons';
import { fetchWithCache } from '../../utils/api';

// Utility functions
const formatLargeNumber = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
const formatApy = (value: number) => `${value.toFixed(2)}%`;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// Sortable Header Component (local to this file)
type SortKeys = 'symbol' | 'project' | 'chain' | 'tvlUsd' | 'apy';
const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKeys;
    sortConfig: { key: SortKeys; direction: 'asc' | 'desc' } | null;
    onSort: (key: SortKeys) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, onSort, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => onSort(sortKey)}>
            <div className="flex items-center">
                <span>{label}</span>
                {isSorted && (
                    <span className="ml-2">
                        {sortConfig?.direction === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                    </span>
                )}
            </div>
        </th>
    );
};

const ITEMS_PER_PAGE = 50;

const YieldAggregator: React.FC = () => {
    const [allPools, setAllPools] = useState<YieldPool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters State
    const [assetSearch, setAssetSearch] = useState('');
    const [chainFilter, setChainFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [minApy, setMinApy] = useState('');
    const [maxApy, setMaxApy] = useState('');
    const [minTvl, setMinTvl] = useState('');
    const [maxTvl, setMaxTvl] = useState('');

    const debouncedAssetSearch = useDebounce(assetSearch, 300);

    // Sorting & Pagination State
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'tvlUsd', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);

    // Data Fetching
    useEffect(() => {
        const fetchYields = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchWithCache<{ status: string; data: YieldPool[] }>('llama-yield-pools', 'https://yields.llama.fi/pools', 600);
                if (result?.status !== 'success' || !Array.isArray(result.data)) {
                    throw new Error("Invalid data format from API.");
                }
                const validPools = result.data.filter((pool: YieldPool) => pool.apy > 0 && pool.tvlUsd > 1000 && pool.symbol.includes('-'));
                setAllPools(validPools);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchYields();
    }, []);

    // Memoized selectors for filters
    const uniqueChains = useMemo(() => {
        const chains = new Set(allPools.map(p => p.chain));
        return Array.from(chains).sort();
    }, [allPools]);

    const uniqueProjects = useMemo(() => {
        const projects = new Set(allPools.map(p => p.project));
        return Array.from(projects).sort();
    }, [allPools]);

    // Filtering, Sorting, and Pagination Logic
    const filteredAndSortedPools = useMemo(() => {
        let tempPools = [...allPools];

        if (chainFilter) tempPools = tempPools.filter(p => p.chain === chainFilter);
        if (projectFilter) tempPools = tempPools.filter(p => p.project === projectFilter);
        if (debouncedAssetSearch) tempPools = tempPools.filter(p => p.symbol.toLowerCase().includes(debouncedAssetSearch.toLowerCase()));

        const numMinApy = parseFloat(minApy);
        if (!isNaN(numMinApy)) tempPools = tempPools.filter(p => p.apy >= numMinApy);
        
        const numMaxApy = parseFloat(maxApy);
        if (!isNaN(numMaxApy)) tempPools = tempPools.filter(p => p.apy <= numMaxApy);
        
        const numMinTvl = parseFloat(minTvl);
        if (!isNaN(numMinTvl)) tempPools = tempPools.filter(p => p.tvlUsd >= numMinTvl);
        
        const numMaxTvl = parseFloat(maxTvl);
        if (!isNaN(numMaxTvl)) tempPools = tempPools.filter(p => p.tvlUsd <= numMaxTvl);

        // Sorting
        tempPools.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return tempPools;
    }, [allPools, chainFilter, projectFilter, debouncedAssetSearch, minApy, maxApy, minTvl, maxTvl, sortConfig]);

    const paginatedPools = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedPools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedPools, currentPage]);
    
    const totalPages = Math.ceil(filteredAndSortedPools.length / ITEMS_PER_PAGE);

    // Handlers
    const handleSort = (key: SortKeys) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setAssetSearch('');
        setChainFilter('');
        setProjectFilter('');
        setMinApy('');
        setMaxApy('');
        setMinTvl('');
        setMaxTvl('');
        setCurrentPage(1);
        setSortConfig({ key: 'tvlUsd', direction: 'desc' });
    };
    
    useEffect(() => {
        setCurrentPage(1);
    }, [chainFilter, projectFilter, debouncedAssetSearch, minApy, maxApy, minTvl, maxTvl]);


    if (isLoading) return <div className="text-center p-8 text-gray-400 bg-primary-dark rounded-lg">Loading thousands of yield opportunities...</div>;
    if (error) return <div className="text-center p-8 text-red-500 bg-primary-dark rounded-lg">Error: {error}</div>;

    const FilterInput: React.FC<{label:string, children: React.ReactNode}> = ({label, children}) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            {children}
        </div>
    );

    return (
        <div className="bg-primary-dark p-6 rounded-lg space-y-6">
            {/* Filters Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <FilterInput label="Asset Search">
                     <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-gray" />
                        <input type="text" placeholder="e.g., ETH or USDC" value={assetSearch} onChange={e => setAssetSearch(e.target.value)} className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white" />
                    </div>
                </FilterInput>

                <FilterInput label="Chain">
                    <select value={chainFilter} onChange={e => setChainFilter(e.target.value)} className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white">
                        <option value="">All Chains</option>
                        {uniqueChains.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </FilterInput>
                
                <FilterInput label="Protocol">
                    <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white">
                        <option value="">All Protocols</option>
                        {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </FilterInput>

                <FilterInput label="APY %">
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={minApy} onChange={e => setMinApy(e.target.value)} className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white" />
                        <input type="number" placeholder="Max" value={maxApy} onChange={e => setMaxApy(e.target.value)} className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white" />
                    </div>
                </FilterInput>

                <FilterInput label="TVL (USD)">
                     <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={minTvl} onChange={e => setMinTvl(e.target.value)} className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white" />
                        <input type="number" placeholder="Max" value={maxTvl} onChange={e => setMaxTvl(e.target.value)} className="w-full bg-secondary-dark border border-border-dark rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white" />
                    </div>
                </FilterInput>
            </div>
            <button onClick={resetFilters} className="text-sm text-accent-blue hover:text-blue-400">Reset Filters</button>

            {/* Results Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-dark">
                    <thead>
                        <tr>
                            <SortableHeader label="Pool" sortKey="symbol" sortConfig={sortConfig} onSort={handleSort} className="w-1/3"/>
                            <SortableHeader label="Project" sortKey="project" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="Chain" sortKey="chain" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="TVL" sortKey="tvlUsd" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="APY" sortKey="apy" sortConfig={sortConfig} onSort={handleSort} />
                        </tr>
                    </thead>
                    <tbody className="bg-primary-dark divide-y divide-border-dark">
                        {paginatedPools.map(pool => (
                             <tr key={pool.pool} className="hover:bg-secondary-dark">
                                <td className="px-4 py-4 whitespace-nowrap"><span className="font-medium text-white">{pool.symbol}</span></td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{pool.project}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{pool.chain}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatLargeNumber(pool.tvlUsd)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-green-400 font-semibold">{formatApy(pool.apy)}</td>
                             </tr>
                        ))}
                    </tbody>
                </table>
                 {paginatedPools.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No pools found matching your criteria. Try adjusting your filters.</div>
                )}
            </div>
            
            {/* Pagination */}
             <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                    Showing {paginatedPools.length > 0 ? Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredAndSortedPools.length) : 0}
                    - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedPools.length)} of {filteredAndSortedPools.length} pools
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-gray-700">
                        Previous
                    </button>
                    <span className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                    </span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-gray-700">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default YieldAggregator;
