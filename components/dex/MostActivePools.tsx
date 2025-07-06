import React, { useState, useMemo } from 'react';
import { DexPool } from '../../types';
import { ArrowUpIcon, ArrowDownIcon } from '../icons';

const formatLargeNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

type SortKeys = 'pairName' | 'dex' | 'chain' | 'tvl' | 'apy';

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

interface TrendingPoolsProps {
    pools: DexPool[];
    isLoading: boolean;
    error: string | null;
    onPoolSelect: (pool: DexPool) => void;
}

const TrendingPools: React.FC<TrendingPoolsProps> = ({ pools, isLoading, error, onPoolSelect }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'tvl', direction: 'desc' });

    const sortedData = useMemo(() => {
        let sortableItems = [...pools];
        sortableItems.sort((a, b) => {
            const { key, direction } = sortConfig;
            const aVal = a[key];
            const bVal = b[key];

            if (key === 'pairName' || key === 'dex' || key === 'chain') {
                return direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
            }
            
            const numA = (aVal != null && isFinite(Number(aVal))) ? Number(aVal) : -Infinity;
            const numB = (bVal != null && isFinite(Number(bVal))) ? Number(bVal) : -Infinity;

            return direction === 'asc' ? numA - numB : numB - numA;
        });
        return sortableItems.slice(0, 100); // Only show top 100
    }, [pools, sortConfig]);

    const handleSort = (key: SortKeys) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };
    
    if (isLoading) return <div className="text-center p-8 text-gray-400">Loading top pools...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="bg-primary-dark p-6 rounded-lg">
            <div className="overflow-x-auto">
                <p className="text-sm text-gray-400 mb-4">Showing the top 100 pools by Total Value Locked (TVL).</p>
                <table className="min-w-full divide-y divide-border-dark">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                            <SortableHeader label="Pool" sortKey="pairName" sortConfig={sortConfig} onSort={handleSort} className="w-1/3"/>
                            <SortableHeader label="DEX" sortKey="dex" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="Chain" sortKey="chain" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="TVL" sortKey="tvl" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="APY" sortKey="apy" sortConfig={sortConfig} onSort={handleSort} />
                        </tr>
                    </thead>
                    <tbody className="bg-primary-dark divide-y divide-border-dark">
                        {sortedData.map((pool, index) => (
                            <tr key={pool.id} onClick={() => onPoolSelect(pool)} className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{index + 1}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="font-medium text-white">{pool.pairName}</span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{pool.dex}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{pool.chain}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatLargeNumber(pool.tvl)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{pool.apy != null ? `${pool.apy.toFixed(2)}%` : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedData.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-gray-500">
                        No active pools found from the API.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingPools;