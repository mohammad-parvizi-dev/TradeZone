import React, { useState, useEffect } from 'react';
import { SelectedCoin } from '../types';
import AdvancedChart from '../components/charting/AdvancedChart';
import HistoricalDataView from '../components/charting/HistoricalDataView';
import CoinSelection from '../components/charting/CoinSelection';
import { ChartIcon, ListIcon } from '../components/icons';

interface AdvancedChartingProps {
  selectedCoin: SelectedCoin | null;
  setSelectedCoin: (coin: SelectedCoin | null) => void;
}

type ActiveTab = 'chart' | 'data';

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

const exchangeNameMap: { [key: string]: string } = {
    binance_futures: "Binance Futures",
    bybit: "Bybit",
    okx_swap: "OKX",
};

const getDisplayName = (name: string) => {
    return exchangeNameMap[name] || name.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
};


const AdvancedCharting: React.FC<AdvancedChartingProps> = ({ selectedCoin, setSelectedCoin }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('chart');

    const handleClearSelection = () => {
        setSelectedCoin(null);
    }

    if (!selectedCoin) {
        return <CoinSelection setSelectedCoin={setSelectedCoin} />;
    }
    
    const isFuture = !!selectedCoin.exchange;

    // When a future is selected, historical data might not be available via the current API.
    // Reset to 'chart' tab if it was on 'data' and user selects a future.
    useEffect(() => {
        if (isFuture && activeTab === 'data') {
            setActiveTab('chart');
        }
    }, [isFuture, activeTab]);

    const pageTitle = isFuture
        ? `${selectedCoin.symbol} on ${getDisplayName(selectedCoin.exchange!)}`
        : `${selectedCoin.id.charAt(0).toUpperCase() + selectedCoin.id.slice(1)} (${selectedCoin.symbol}/USD)`;


    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                 <h1 className="text-2xl font-semibold text-white">
                    {pageTitle}
                </h1>
                <button
                    onClick={handleClearSelection}
                    className="text-sm bg-secondary-dark text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Select Another Coin
                </button>
            </div>
           
            <div className="border-b border-border-dark">
                <div className="flex items-center space-x-2">
                    <TabButton label="Advanced Chart" tabName="chart" Icon={ChartIcon} activeTab={activeTab} onClick={setActiveTab} />
                    {!isFuture && (
                        <TabButton label="Historical Data" tabName="data" Icon={ListIcon} activeTab={activeTab} onClick={setActiveTab} />
                    )}
                </div>
            </div>

            <div className="mt-4">
                {activeTab === 'chart' && <AdvancedChart selectedCoin={selectedCoin} />}
                {activeTab === 'data' && !isFuture && <HistoricalDataView selectedCoin={selectedCoin} />}
            </div>
        </div>
    );
};

export default AdvancedCharting;
