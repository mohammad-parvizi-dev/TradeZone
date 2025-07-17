
import React, { useState, useEffect, useMemo } from 'react';
import { DexProtocol } from '../../types';
import { ArrowUpIcon, ArrowDownIcon } from '../icons';
import { fetchWithCache } from '../../utils/api';

const formatLargeNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

type SortKeys = 'name' | 'dailyVolume' | 'tvl';

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


const DEXRankings: React.FC = () => {
    const [protocols, setProtocols] = useState<DexProtocol[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'dailyVolume', direction: 'desc' });

    useEffect(() => {
        const fetchDexes = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchWithCache<DexProtocol[]>('llama-protocols', 'https://api.llama.fi/protocols', 3600);
                // Broaden filter to include "Derivatives" as they function as DEXs for many users.
                const dexes = data.filter(p => {
                    const category = p.category?.trim().toLowerCase();
                    return category === 'dexes' || category === 'dex' || category === 'derivatives';
                });
                setProtocols(dexes);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchDexes();
    }, []);
    
    const sortedData = useMemo(() => {
        let sortableItems = [...protocols];
        
        sortableItems.sort((a, b) => {
            const { key, direction } = sortConfig;
            const aVal = a[key];
            const bVal = b[key];

            if (key === 'name') {
                const strA = String(aVal ?? '').toLowerCase();
                const strB = String(bVal ?? '').toLowerCase();
                if (strA < strB) return direction === 'asc' ? -1 : 1;
                if (strA > strB) return direction === 'asc' ? 1 : -1;
                return 0;
            } else {
                // Handle numeric sort robustly
                const numA = (aVal != null && isFinite(Number(aVal))) ? Number(aVal) : -Infinity;
                const numB = (bVal != null && isFinite(Number(bVal))) ? Number(bVal) : -Infinity;
                
                if (direction === 'asc') {
                    return numA - numB;
                } else {
                    return numB - numA;
                }
            }
        });
        
        return sortableItems;
    }, [protocols, sortConfig]);

    const handleSort = (key: SortKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    if (loading) return <div className="text-center p-8 text-gray-400">Loading DEX rankings...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;


    return (
        <div className="bg-primary-dark p-6 rounded-lg">
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-dark">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                            <SortableHeader label="Name" sortKey="name" sortConfig={sortConfig} onSort={handleSort} className="w-1/4"/>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Chains</th>
                            <SortableHeader label="24h Volume" sortKey="dailyVolume" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="TVL" sortKey="tvl" sortConfig={sortConfig} onSort={handleSort} />
                        </tr>
                    </thead>
                    <tbody className="bg-primary-dark divide-y divide-border-dark">
                        {sortedData.map((dex, index) => (
                            <tr key={dex.id} className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{index + 1}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={dex.logo} alt={dex.name} className="w-6 h-6 mr-3 rounded-full bg-gray-800"/>
                                        <span className="font-medium text-white">{dex.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <div className="flex flex-wrap gap-1">
                                        {dex.chains?.slice(0, 3).map(chain => (
                                            <span key={chain} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{chain}</span>
                                        ))}
                                        {(dex.chains?.length ?? 0) > 3 && (
                                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">+{dex.chains.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatLargeNumber(dex.dailyVolume)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatLargeNumber(dex.tvl)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedData.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        No DEXs found. The API might be unavailable or have no protocols listed under the 'DEX' category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DEXRankings;
