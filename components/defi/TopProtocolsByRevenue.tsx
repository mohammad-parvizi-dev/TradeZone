
import React, { useState, useEffect, useMemo } from 'react';
import { ProtocolRevenueData } from '../../types';
import { ArrowUpIcon, ArrowDownIcon, InfoIcon, SearchIcon } from '../icons';
import { fetchWithCache } from '../../utils/api';

const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) {
        return 'N/A';
    }
    return `$${amount.toLocaleString(undefined, {notation: 'compact', minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};

type SortKeys = 'name' | 'category' | 'dailyFees' | 'dailyRevenue';

const tooltips: Record<string, string> = {
    dailyFees: "Total fees paid by users to the protocol in the last 24 hours.",
    dailyRevenue: "Portion of fees that go to the protocol treasury and/or token holders in the last 24 hours."
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKeys;
    tooltip?: string;
    sortConfig: { key: SortKeys; direction: 'asc' | 'desc' } | null;
    onSort: (key: SortKeys) => void;
    className?: string;
}> = ({ label, sortKey, tooltip, sortConfig, onSort, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => onSort(sortKey)}>
            <div className="flex items-center group">
                <span>{label}</span>
                {tooltip && <InfoIcon tooltip={tooltip} />}
                {isSorted && (
                    <span className="ml-1">
                        {sortConfig?.direction === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                    </span>
                )}
            </div>
        </th>
    );
};

const ITEMS_PER_PAGE = 25;

const TopProtocolsByRevenue: React.FC = () => {
  const [protocols, setProtocols] = useState<ProtocolRevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'dailyRevenue', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchWithCache<{ protocols: ProtocolRevenueData[] }>('llama-fees', 'https://api.llama.fi/overview/fees?excludeTotalData=true', 3600);
        if (!data || !Array.isArray(data.protocols)) {
          throw new Error("Invalid revenue data structure from API.");
        }
        setProtocols(data.protocols);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevenueData();
  }, []);

  const filteredData = useMemo(() => {
    return protocols.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [protocols, searchTerm]);

  const sortedData = useMemo(() => {
      let sortableItems = [...filteredData];
      sortableItems.sort((a, b) => {
          const { key, direction } = sortConfig;
          const aVal = a[key];
          const bVal = b[key];
          
          if (typeof aVal === 'string' && typeof bVal === 'string') {
              return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
          }
          
          const numA = (aVal != null && isFinite(Number(aVal))) ? Number(aVal) : null;
          const numB = (bVal != null && isFinite(Number(bVal))) ? Number(bVal) : null;

          if (numA === null && numB === null) return 0;
          if (numA === null) return 1;
          if (numB === null) return -1;
          
          if (numA < numB) return direction === 'asc' ? -1 : 1;
          if (numA > numB) return direction === 'asc' ? 1 : -1;
          return 0;
      });
      return sortableItems;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const handleSort = (key: SortKeys) => {
      setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const startResult = Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, sortedData.length);
  const endResult = Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length);

  if (isLoading) return <div className="text-center p-8 text-gray-400">Loading top protocols by revenue...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-primary-dark p-6 rounded-lg">
        <div className="flex justify-end mb-4">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-gray" />
                <input
                    type="text"
                    placeholder="Search protocol or category..."
                    value={searchTerm}
                    onChange={e => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="bg-secondary-dark border border-border-dark rounded-lg py-2 pl-10 pr-4 w-72 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-dark">
                <thead>
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                        <SortableHeader label="Protocol" sortKey="name" sortConfig={sortConfig} onSort={handleSort} className="w-1/3" />
                        <SortableHeader label="Category" sortKey="category" sortConfig={sortConfig} onSort={handleSort} />
                        <SortableHeader label="24h Fees" sortKey="dailyFees" tooltip={tooltips.dailyFees} sortConfig={sortConfig} onSort={handleSort} />
                        <SortableHeader label="24h Revenue" sortKey="dailyRevenue" tooltip={tooltips.dailyRevenue} sortConfig={sortConfig} onSort={handleSort} />
                    </tr>
                </thead>
                <tbody className="bg-primary-dark divide-y divide-border-dark">
                    {paginatedData.map((protocol, index) => (
                    <tr key={protocol.slug} className="hover:bg-secondary-dark transition-colors duration-200">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <img src={protocol.logo} alt={`${protocol.name} logo`} className="w-6 h-6 mr-3 rounded-full bg-gray-800" />
                                <span className="font-medium text-white">{protocol.name}</span>
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{protocol.category}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatCurrency(protocol.dailyFees)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">{formatCurrency(protocol.dailyRevenue)}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
            {paginatedData.length === 0 && !isLoading && (
              <div className="text-center py-10 text-gray-500">No protocols found matching your search.</div>
            )}
        </div>
        <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-400">
                {sortedData.length > 0 ? `Showing ${startResult} to ${endResult} of ${sortedData.length} protocols` : 'No results'}
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-gray-700">
                    Previous
                </button>
                <span className="text-sm text-gray-400">
                    Page {currentPage > 0 ? currentPage : 1} of {totalPages > 0 ? totalPages : 1}
                </span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-gray-700">
                    Next
                </button>
            </div>
        </div>
    </div>
  );
};

export default TopProtocolsByRevenue;
