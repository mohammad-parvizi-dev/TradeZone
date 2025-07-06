import React, { useState } from 'react';
import { SelectedCoin } from '../types';
import OiVsPriceView from '../components/open-interest/OiVsPriceView';
import TopContractsView from '../components/open-interest/TopContractsView';
import { ChartIcon, ListIcon } from '../components/icons';

type ActiveTab = 'chart' | 'top-contracts';

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


interface OpenInterestAnalysisProps {
    setActiveItemId: (id: string) => void;
    setSelectedCoin: (coin: SelectedCoin) => void;
}

const OpenInterestAnalysis: React.FC<OpenInterestAnalysisProps> = ({ setActiveItemId, setSelectedCoin }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('chart');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-white">Open Interest Analysis</h1>

            <div className="border-b border-border-dark">
                <div className="flex items-center space-x-2">
                    <TabButton 
                        label="OI vs. Price Chart"
                        tabName="chart"
                        Icon={ChartIcon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                     <TabButton 
                        label="Top Contracts by OI"
                        tabName="top-contracts"
                        Icon={ListIcon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                </div>
            </div>
            
            <div className="mt-4">
                {activeTab === 'chart' && <OiVsPriceView />}
                {activeTab === 'top-contracts' && <TopContractsView setActiveItemId={setActiveItemId} setSelectedCoin={setSelectedCoin} />}
            </div>
        </div>
    );
};

export default OpenInterestAnalysis;
