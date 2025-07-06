import React, { useState, useMemo } from 'react';
import { SelectedCoin, DerivativeData } from '../../types';
import { ArrowUpIcon, ArrowDownIcon, InfoIcon } from '../icons';

const formatNumber = (num: number | string | null | undefined, options: Intl.NumberFormatOptions = {}) => {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (number === null || number === undefined || isNaN(number)) return 'N/A';
    return new Intl.NumberFormat('en-US', options).format(number);
};

const formatFundingRate = (rate: number | null | undefined) => {
    if (rate === null || rate === undefined) return 'N/A';
    return `${(rate * 100).toFixed(4)}%`;
};

// This is a simplified mock; a real app would have a more robust logo mapping/service.
const getExchangeLogo = (exchangeName: string) => {
    const name = exchangeName.toLowerCase().replace('_futures', '').replace('_swap', '');
    const cdnUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@main/32/color/${name}.png`;
    const fallbackUrl = 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/1.png'; // Generic fallback
    return cdnUrl;
};

type SortKeys = keyof DerivativeData;
const tooltips: Record<string, string> = {
    exchange: "The exchange where the contract is traded.",
    pair: "The trading pair for the futures contract.",
    price: "The last price at which the contract was traded.",
    markPrice: "The estimated true value of the contract, used for calculating PnL and liquidations. (Data not available from this source)",
    funding_rate: "The periodic payment exchanged between long and short positions to keep the contract price close to the spot price.",
    open_interest: "The total value in USD of all outstanding (not settled) futures contracts.",
    volume_24h: "The total trading volume for this contract in the last 24 hours (in USD)."
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKeys;
    tooltip: string;
    sortConfig: { key: SortKeys; direction: 'asc' | 'desc' } | null;
    onSort: (key: SortKeys) => void;
    className?: string;
}> = ({ label, sortKey, tooltip, sortConfig, onSort, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => onSort(sortKey)}>
            <div className="flex items-center group">
                <span>{label}</span>
                <InfoIcon tooltip={tooltip} />
                {isSorted && (
                    <span className="ml-1">
                        {sortConfig?.direction === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                    </span>
                )}
            </div>
        </th>
    );
};

const ContractsComparisonTable: React.FC<{
    contracts: DerivativeData[];
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin) => void;
}> = ({ contracts, setActiveItemId, setSelectedCoin }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'volume_24h', direction: 'desc' });

    const sortedData = useMemo(() => {
        let sortableItems = [...contracts];
        if (sortConfig !== null) {
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
        }
        return sortableItems;
    }, [contracts, sortConfig]);
    
    const handleSort = (key: SortKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleRowClick = (contract: DerivativeData) => {
        setSelectedCoin({
            id: `${contract.market}-${contract.symbol}`, // Unique ID for the contract
            symbol: contract.symbol,
            exchange: contract.market,
        });
        setActiveItemId('advanced-charting');
    };
    
    if (contracts.length === 0) {
        return <div className="text-center py-8 text-gray-400">No perpetual contracts found for this asset. Try another one.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-dark">
                <thead>
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider group">
                           <div className="flex items-center">Exchange <InfoIcon tooltip={tooltips.exchange} /></div>
                        </th>
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider group">
                           <div className="flex items-center">Pair <InfoIcon tooltip={tooltips.pair} /></div>
                        </th>
                        <SortableHeader label="Last Price" sortKey="price" tooltip={tooltips.price} sortConfig={sortConfig} onSort={handleSort} />
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider group">
                           <div className="flex items-center">Mark Price <InfoIcon tooltip={tooltips.markPrice} /></div>
                        </th>
                        <SortableHeader label="Funding Rate" sortKey="funding_rate" tooltip={tooltips.funding_rate} sortConfig={sortConfig} onSort={handleSort} />
                        <SortableHeader label="Open Interest" sortKey="open_interest" tooltip={tooltips.open_interest} sortConfig={sortConfig} onSort={handleSort} />
                        <SortableHeader label="24h Volume" sortKey="volume_24h" tooltip={tooltips.volume_24h} sortConfig={sortConfig} onSort={handleSort} />
                    </tr>
                </thead>
                <tbody className="bg-primary-dark divide-y divide-border-dark">
                    {sortedData.map(contract => (
                        <tr key={`${contract.market}-${contract.symbol}`} onClick={() => handleRowClick(contract)} className="hover:bg-secondary-dark transition-colors duration-200 cursor-pointer">
                            <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <img 
                                      src={getExchangeLogo(contract.market)} 
                                      alt={contract.market}
                                      onError={(e) => { e.currentTarget.src = 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/1.png'; e.currentTarget.onerror = null; }}
                                      className="w-6 h-6 mr-3 rounded-full bg-gray-700"
                                    />
                                    <span className="font-medium text-white capitalize">{contract.market.replace(/_futures|_swap/g, '')}</span>
                                </div>
                            </td>
                             <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{contract.symbol}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${formatNumber(contract.price)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">N/A</td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${contract.funding_rate > 0 ? 'text-green-500' : 'text-red-500'}`}>{formatFundingRate(contract.funding_rate)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${formatNumber(contract.open_interest, { notation: 'compact', maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${formatNumber(contract.volume_24h, { notation: 'compact', maximumFractionDigits: 2 })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ContractsComparisonTable;