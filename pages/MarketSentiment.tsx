import React, { useState } from 'react';
import FundingRateTracker from './FundingRateTracker';
import HistoricalFundingRate from './HistoricalFundingRate';
import { ListIcon, ChartIcon } from '../components/icons';

type ActiveTab = 'tracker' | 'historical';

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


const MarketSentiment: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('tracker');

    return (
        <div className="space-y-6">
             <h1 className="text-2xl font-semibold text-white">Market Sentiment</h1>

            <div className="border-b border-border-dark">
                 <div className="flex items-center space-x-2">
                     <TabButton 
                        label="Funding Rate Tracker"
                        tabName="tracker"
                        Icon={ListIcon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                     <TabButton 
                        label="Historical Funding Rate"
                        tabName="historical"
                        Icon={ChartIcon}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                    />
                 </div>
            </div>
            
            <div className="mt-4">
                {activeTab === 'tracker' && <FundingRateTracker />}
                {activeTab === 'historical' && <HistoricalFundingRate />}
            </div>
        </div>
    );
};

export default MarketSentiment;
