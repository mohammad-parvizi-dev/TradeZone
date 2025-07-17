import React from 'react';
import { MenuItemType } from './types';
import { 
  DashboardIcon, ChartIcon, CryptoIcon, ForexIcon, StockIcon, CommoditiesIcon, WatchlistIcon, AnalysisIcon, DeFiIcon, 
  TradingToolsIcon, PortfolioIcon, AIAssistantIcon, AlphaBotIcon, CopyTradingIcon, LeadTradersIcon, SpotFuturesSettingsIcon, 
  ConnectionIcon, SignedAgreementIcon, EducationGuidesIcon, HelpCenterIcon, FAQIcon, TicketsIcon, ContactUsIcon, 
  TermsIcon, PrivacyIcon, AccountIcon, ProfileSecurityIcon, SubscriptionPlansIcon, AssetsIcon, ExchangeApiIcon, 
  InviteFriendsIcon, LeaderboardIcon, SubItemIcon, RiskMonitoringIcon
} from './components/icons';

export const menuItems: MenuItemType[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, href: '#' },
  { 
    id: 'charts', label: 'Charts', icon: ChartIcon, children: [
      { 
        id: 'crypto', label: 'Crypto', icon: CryptoIcon, children: [
          { 
            id: 'spot', label: 'Spot', icon: SubItemIcon, children: [
              { id: 'market-overview', label: 'Market Overview', icon: SubItemIcon },
              { id: 'market-movers', label: 'Market Movers', icon: SubItemIcon },
              { id: 'advanced-charting', label: 'Advanced Charting', icon: SubItemIcon },
            ]
          },
          { 
            id: 'futures', label: 'Futures', icon: SubItemIcon, children: [
                { id: 'futures-dashboard', label: 'Futures Dashboard', icon: SubItemIcon },
                { id: 'market-sentiment', label: 'Market Sentiment', icon: SubItemIcon },
                { id: 'open-interest-analysis', label: 'Open Interest Analysis', icon: SubItemIcon },
                { id: 'risk-monitoring', label: 'Risk Monitoring', icon: SubItemIcon },
            ]
          },
          { 
            id: 'dex-monitor', 
            label: 'DEX Monitor', 
            icon: DeFiIcon,
            children: [
              { id: 'dex-overview', label: 'DEX Overview', icon: SubItemIcon },
              { id: 'pools-pairs-analysis', label: 'Pools & Pairs Analysis', icon: SubItemIcon },
            ]
          },
          { 
            id: 'defi-tokens', 
            label: 'DeFi Tokens', 
            icon: DeFiIcon,
            children: [
              { id: 'defi-health-dashboard', label: 'DeFi Health Dashboard', icon: SubItemIcon },
              { id: 'protocol-rankings', label: 'Protocol Rankings', icon: SubItemIcon },
              { id: 'yield-opportunities', label: 'Yield Opportunities', icon: SubItemIcon },
            ]
          },
          { 
            id: 'stablecoins', 
            label: 'Stablecoins', 
            icon: SubItemIcon, 
            children: [
              { id: 'monitoring-dashboard', label: 'Monitoring Dashboard', icon: SubItemIcon },
              { id: 'peg-stability-monitor', label: 'Peg Stability Monitor', icon: SubItemIcon },
              { id: 'distribution-analysis', label: 'Distribution Analysis', icon: SubItemIcon },
            ]
          },
        ] 
      },
      { id: 'forex', label: 'Forex', icon: ForexIcon, href: '#' },
      { id: 'stocks', label: 'Stocks', icon: StockIcon, href: '#' },
      { id: 'commodities', label: 'Commodities', icon: CommoditiesIcon, href: '#', isLocked: true },
      { id: 'custom-watchlist', label: 'Custom Watchlist', icon: WatchlistIcon, href: '#', isLocked: true },
    ]
  },
  { id: 'fundamental-analysis', label: 'Fundamental Analysis', icon: AnalysisIcon, href: '#', badge: 'Soon' },
  { id: 'web3-defi', label: 'Web 3.0 DeFi', icon: DeFiIcon, href: '#', badge: 'Soon' },
  {
    id: 'trading-tools', label: 'Trading Tools', icon: TradingToolsIcon, children: [
      { id: 'portfolio-dashboard', label: 'Portfolio Dashboard', icon: PortfolioIcon, href: '#' }
    ]
  },
  {
    id: 'ai-tools', label: 'AI Tools Assistant', icon: AIAssistantIcon, children: [
       { id: 'alpha-bot', label: 'Alpha Bot', icon: AlphaBotIcon, href: '#' }
    ]
  },
  {
    id: 'copy-trading', label: 'Copy Trading', icon: CopyTradingIcon, children: [
      { id: 'lead-traders', label: 'Lead Traders', icon: LeadTradersIcon, href: '#' },
      { id: 'spot-futures-settings', label: 'Spot Futures Settings', icon: SpotFuturesSettingsIcon, href: '#' },
      { id: 'connection', label: 'Connection', icon: ConnectionIcon, href: '#' },
      { id: 'signed-agreement', label: 'Signed Agreement', icon: SignedAgreementIcon, href: '#' },
    ]
  },
  { id: 'education-guides', label: 'Education Guides', icon: EducationGuidesIcon, href: '#' },
  {
    id: 'help-center', label: 'Help Center', icon: HelpCenterIcon, children: [
      { id: 'faq', label: 'FAQ', icon: FAQIcon, href: '#' },
      { id: 'tickets', label: 'Tickets', icon: TicketsIcon, href: '#' },
      { id: 'contact-us', label: 'Contact Us', icon: ContactUsIcon, href: '#' },
    ]
  },
  { id: 'terms', label: 'Terms And Collections', icon: TermsIcon, href: '#' },
  { id: 'privacy', label: 'Privacy Policy', icon: PrivacyIcon, href: '#' },
  {
    id: 'account', label: 'Account', icon: AccountIcon, children: [
      { id: 'profile-security', label: 'Profile Security', icon: ProfileSecurityIcon, href: '#' },
      { id: 'subscription-plans', label: 'Subscription Plans', icon: SubscriptionPlansIcon, href: '#' },
      { id: 'assets', label: 'Assets', icon: AssetsIcon, href: '#' },
      { id: 'exchange-api', label: 'Exchange Api', icon: ExchangeApiIcon, href: '#' },
    ]
  },
  {
    id: 'invite-friends', label: 'Invite Friends', icon: InviteFriendsIcon, children: []
  },
  { id: 'leaderboard', label: 'Leaderboard', icon: LeaderboardIcon, href: '#' },
];

export const popularAssets: string[] = [
  'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'BNB',
  'LINK', 'AVAX', 'DOT', 'MATIC', 'LTC', 'BCH', 'TRX', 'UNI', 'NEAR', 'ATOM'
];