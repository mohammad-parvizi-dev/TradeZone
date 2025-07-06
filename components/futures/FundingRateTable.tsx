import React, { useState, useMemo } from 'react';
import { DerivativeData } from '../../types';
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

const getExchangeLogo = (exchangeName: string) => {
    const name = exchangeName.toLowerCase().replace(/_futures|_swap/g, '');
    const cdnUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@main/32/color/${name}.png`;
    return cdnUrl;
};

type SortKeys = keyof DerivativeData;
const tooltips: Record<string, string> = {
    exchange: "The exchange where the contract is traded.",
    pair: "The trading pair for the futures contract.",
    price: "The last price at which the contract was traded.",
    funding_rate: "The periodic payment exchanged between long and short positions to keep the contract price close to the spot price. Positive means longs pay shorts, negative means shorts pay longs.",
    next_funding_time: "The time of the next funding payment event. (Data not available from this source)",
    mark_price: "The estimated true value of the contract, used for calculating PnL and liquidations.",
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKeys;
    tooltip: string;
    sortConfig: { key: SortKeys; direction: 'asc' | 'desc' } | null;
    onSort: (key: SortKeys) => void;
}> = ({ label, sortKey, tooltip, sortConfig, onSort }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => onSort(sortKey)}>
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

const FundingRateTable: React.FC<{ contracts: DerivativeData[] }> = ({ contracts }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' }>({ key: 'funding_rate', direction: 'desc' });

    const sortedData = useMemo(() => {
        let sortableItems = [...contracts];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;
                
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
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
    
    if (contracts.length === 0) {
        return <div className="text-center py-8 text-gray-400">No matching perpetual contracts found. Adjust your filters.</div>;
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider group">
                           <div className="flex items-center">Mark Price <InfoIcon tooltip={tooltips.mark_price} /></div>
                        </th>
                        <SortableHeader label="Funding Rate" sortKey="funding_rate" tooltip={tooltips.funding_rate} sortConfig={sortConfig} onSort={handleSort} />
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider group">
                           <div className="flex items-center">Next Funding <InfoIcon tooltip={tooltips.next_funding_time} /></div>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-primary-dark divide-y divide-border-dark">
                    {sortedData.map(contract => (
                        <tr key={`${contract.market}-${contract.symbol}`} className="hover:bg-secondary-dark transition-colors duration-200">
                            <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <img 
                                      src={getExchangeLogo(contract.market)} 
                                      alt={contract.market}
                                      onError={(e) => { e.currentTarget.src = 'https://s2.coinmarketcap.com/static/img/exchanges/64x64/1.png'; e.currentTarget.onerror = null; }}
                                      className="w-6 h-6 mr-3 rounded-full bg-gray-700"
                                    />
                                    <span className="font-medium text-white capitalize">{contract.market.replace(/_/g, ' ')}</span>
                                </div>
                            </td>
                             <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{contract.symbol}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-mono">${formatNumber(contract.price)}</td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${contract.funding_rate > 0 ? 'text-green-500' : 'text-red-500'}`}>{formatFundingRate(contract.funding_rate)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">N/A</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FundingRateTable;
