
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { menuItems } from './constants';
import { MenuItemType, SelectedCoin } from './types';
import MarketOverview from './pages/MarketOverview';
import MarketMovers from './pages/MarketMovers';
import AdvancedCharting from './pages/AdvancedCharting';
import FuturesDashboard from './pages/FuturesDashboard';
import MarketSentiment from './pages/MarketSentiment';
import OpenInterestAnalysis from './pages/OpenInterestAnalysis';
import FearAndGreedIndex from './pages/FearAndGreedIndex';
import DEXOverview from './pages/DEXOverview';
import PoolsAndPairsAnalysis from './pages/PoolsAndPairsAnalysis';
import DeFiHealthDashboard from './pages/DeFiHealthDashboard';
import ProtocolRankings from './pages/ProtocolRankings';
import YieldOpportunities from './pages/YieldOpportunities';
import MonitoringDashboard from './pages/MonitoringDashboard';
import PegStabilityMonitor from './pages/PegStabilityMonitor';
import DistributionAnalysis from './pages/DistributionAnalysis';
import ForexRatesTable from './pages/ForexRatesTable';
import ForexAdvancedCharting from './pages/ForexAdvancedCharting';
import ForexHeatmap from './pages/ForexHeatmap';
import ForexPerformanceLeaders from './pages/ForexPerformanceLeaders';
import ForexCurrencyStrengthMeter from './pages/ForexCurrencyStrengthMeter';
import ForexHistoricalData from './pages/ForexHistoricalData';
import EconomicCalendar from './pages/EconomicCalendar';
import CentralBankHub from './pages/CentralBankHub';
import ForexNewsAnalysis from './pages/ForexNewsAnalysis';


// Helper function to find the breadcrumb path for a given item ID
const findPath = (items: MenuItemType[], targetId: string, currentPath: string[] = []): string[] | null => {
  for (const item of items) {
    const newPath = [...currentPath, item.label];
    if (item.id === targetId) {
      return newPath;
    }
    if (item.children) {
      const result = findPath(item.children, targetId, newPath);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

const App: React.FC = () => {
  const [activeItemId, setActiveItemId] = useState<string>('market-overview');
  const [selectedCoin, setSelectedCoin] = useState<SelectedCoin | null>({ id: 'bitcoin', symbol: 'BTC' });
  const [selectedForexPair, setSelectedForexPair] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    charts: true,
    crypto: true,
    spot: true,
    futures: true,
    'dex-monitor': true,
    'defi-tokens': true,
    stablecoins: true,
    forex: true,
    'forex-market-overview': true,
    'forex-advanced-charting': true,
    'forex-fundamental-analysis': true,
  });
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const path = findPath(menuItems, activeItemId);
    if (path) {
      setBreadcrumbs(path);
      setPageTitle(path[path.length - 1] ?? '');
    } else {
      // Fallback for initial state or if not found
      const dashboardPath = findPath(menuItems, 'dashboard') ?? ['Dashboard'];
      setBreadcrumbs(dashboardPath);
      setPageTitle(dashboardPath[dashboardPath.length - 1] ?? '');
    }
  }, [activeItemId]);

  const toggleOpenItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderContent = () => {
    const navigationProps = {
        setActiveItemId,
        setSelectedCoin
    };
    const forexNavigationProps = {
        setActiveItemId,
        setSelectedForexPair
    };

    switch (activeItemId) {
      case 'market-overview':
        return <MarketOverview {...navigationProps} />;
      case 'market-movers':
        return <MarketMovers {...navigationProps} />;
      case 'advanced-charting':
        return <AdvancedCharting selectedCoin={selectedCoin} setSelectedCoin={setSelectedCoin} />;
      case 'futures-dashboard':
        return <FuturesDashboard {...navigationProps} />;
      case 'market-sentiment':
        return <MarketSentiment />;
      case 'open-interest-analysis':
        return <OpenInterestAnalysis {...navigationProps} />;
      case 'risk-monitoring':
        return <FearAndGreedIndex />;
      case 'dex-overview':
        return <DEXOverview />;
      case 'pools-pairs-analysis':
        return <PoolsAndPairsAnalysis setActiveItemId={setActiveItemId} setSelectedCoin={setSelectedCoin} />;
      case 'defi-health-dashboard':
        return <DeFiHealthDashboard />;
      case 'protocol-rankings':
        return <ProtocolRankings />;
      case 'yield-opportunities':
        return <YieldOpportunities />;
      case 'monitoring-dashboard':
        return <MonitoringDashboard />;
      case 'peg-stability-monitor':
        return <PegStabilityMonitor />;
      case 'distribution-analysis':
        return <DistributionAnalysis />;
      case 'forex-rates-table':
        return <ForexRatesTable {...forexNavigationProps} />;
      case 'forex-full-analytical-chart':
        return <ForexAdvancedCharting selectedForexPair={selectedForexPair} setActiveItemId={setActiveItemId} />;
      case 'forex-historical-data':
        return <ForexHistoricalData />;
      case 'forex-heatmap':
        return <ForexHeatmap />;
      case 'forex-performance-leaders':
        return <ForexPerformanceLeaders />;
      case 'forex-currency-strength-meter':
        return <ForexCurrencyStrengthMeter />;
      case 'economic-calendar':
        return <EconomicCalendar />;
      case 'central-bank-hub':
        return <CentralBankHub />;
      case 'news-analysis':
        return <ForexNewsAnalysis />;
      default:
        return (
          <div className="flex items-center space-x-2 text-2xl font-semibold text-gray-400">
            <p>{pageTitle} Coming Soon....</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-secondary-dark text-light-gray font-sans">
      <Sidebar 
        activeItemId={activeItemId}
        setActiveItemId={setActiveItemId}
        openItems={openItems}
        toggleOpenItem={toggleOpenItem}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-dark p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
