import React, { useState, useEffect, useMemo } from 'react';
import { SelectedCoin, DerivativeData } from '../types';
import { ArrowUpIcon, ArrowDownIcon, InfoIcon, SearchIcon } from '../components/icons';

const formatNumber = (num: number | string | null | undefined, options: Intl.NumberFormatOptions = {}) => {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (number === null || number === undefined || isNaN(number)) return 'N/A';
    return new Intl.NumberFormat('en-US', options).format(number);
};

const getExchangeLogo = (exchangeName: string) => {
    const name = exchangeName.toLowerCase().replace(/_futures|_swap/g, '');
    const cdnUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@main/32/color/${name}.png`;
    return cdnUrl;
};

type SortKeys = keyof DerivativeData;
const tooltips: Record<string, string> = {
    open_interest: "The total value in USD of all outstanding (not settled) futures contracts.",
    volume_24h: "The total trading volume for this contract in the last 24 hours (in USD)."
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKeys;
    tooltip?: string;
    sortConfig: { key: SortKeys; direction: 'asc' | 'desc' } | null;
    onSort: (key: SortKeys) => void;
}> = ({ label, sortKey, tooltip, sortConfig, onSort }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => onSort(sortKey)}>
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

interface TopContractsByOiProps {
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin) => void;
}

const TopContractsByOi: React.FC<TopContractsByOiProps> = ({ setActiveItemId, setSelectedCoin }) => {
    const [contracts, setContracts] = useState<DerivativeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'open_interest', direction: 'desc' });

    useEffect(() => {
        const fetchContracts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/derivatives?include_tickers=unexpired');
                if (!response.ok) throw new Error('Failed to fetch contracts data');
                const data: DerivativeData[] = await response.json();
                const perpetuals = data.filter(d => d.contract_type === 'perpetual' && d.open_interest && d.open_interest > 0);
                setContracts(perpetuals);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    const filteredData = useMemo(() => {
        return contracts.filter(c =>
            c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.market.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contracts, searchTerm]);

    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        sortableItems.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            const aNum = typeof aVal === 'string' ? parseFloat(aVal) : aVal;
            const bNum = typeof bVal === 'string' ? parseFloat(bVal) : bVal;
            
            if (aNum === null || aNum === undefined) return 1;
            if (bNum === null || bNum === undefined) return -1;
            
            if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [filteredData, sortConfig]);

    const handleSort = (key: SortKeys) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const handleRowClick = (contract: DerivativeData) => {
        setSelectedCoin({
            id: `${contract.market}-${contract.symbol}`,
            symbol: contract.symbol,
            exchange: contract.market,
        });
        setActiveItemId('advanced-charting');
    };

    if (loading) return <div className="text-center p-8 text-gray-400">Loading top contracts...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Top Contracts by Open Interest</h1>
            <div className="bg-primary-dark p-6 rounded-lg">
                <div className="flex justify-end mb-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-gray" />
                        <input
                            type="text"
                            placeholder="Search contract or exchange"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-secondary-dark border border-border-dark rounded-lg py-2 pl-10 pr-4 w-72 focus:outline-none focus:ring-2 focus:ring-accent-blue text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-dark">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Pair</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Exchange</th>
                                <SortableHeader label="Open Interest" sortKey="open_interest" tooltip={tooltips.open_interest} sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Price" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="24h Volume" sortKey="volume_24h" tooltip={tooltips.volume_24h} sortConfig={sortConfig} onSort={handleSort} />
                            </tr>
                        </thead>
                        <tbody className="bg-primary-dark divide-y divide-border-dark">
                            {sortedData.slice(0, 100).map((contract, index) => (
                                <tr key={`${contract.market}-${contract.symbol}`} onClick={() => handleRowClick(contract)} className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer">
                                    <td className="px-4 py-4 text-sm text-gray-400">{index + 1}</td>
                                    <td className="px-4 py-4 text-sm text-white font-medium">{contract.symbol}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <img
                                                src={getExchangeLogo(contract.market)}
                                                alt={contract.market}
                                                onError={(e) => { e.currentTarget.src = 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/1.png'; e.currentTarget.onerror = null; }}
                                                className="w-5 h-5 mr-2 rounded-full bg-gray-700"
                                            />
                                            <span className="text-sm text-white capitalize">{contract.market.replace(/_futures|_swap/g, '')}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-white font-mono">${formatNumber(contract.open_interest, { notation: 'compact', maximumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-4 text-sm text-white font-mono">${formatNumber(contract.price)}</td>
                                    <td className="px-4 py-4 text-sm text-white font-mono">${formatNumber(contract.volume_24h, { notation: 'compact', maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TopContractsByOi;
