import React from 'react';
import { MenuItemType } from '../types';
import { menuItems } from '../constants';
import { LockIcon, ChevronDownIcon, YoutubeIcon, XIcon, DiscordIcon } from './icons';

interface NavItemProps {
  item: MenuItemType;
  level: number;
  openItems: Record<string, boolean>;
  toggleItem: (id: string) => void;
  activeItemId: string;
  setActiveItemId: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, level, openItems, toggleItem, activeItemId, setActiveItemId }) => {
  const isOpen = openItems[item.id] || false;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeItemId === item.id;

  const handleItemClick = () => {
    if (hasChildren) {
      toggleItem(item.id);
    }
    setActiveItemId(item.id);
  };

  const paddingLeft = 1 + level * 1.5;

  const itemClasses = `
    flex items-center justify-between w-full text-left text-sm
    rounded-md cursor-pointer group
    ${isActive ? 'bg-accent-blue text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
  `;

  return (
    <div className="my-1">
      <div className={itemClasses} onClick={handleItemClick} style={{ padding: `0.5rem 1rem 0.5rem ${paddingLeft}rem` }}>
        <div className="flex items-center flex-1 min-w-0 mr-2">
          <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {item.badge && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">{item.badge}</span>}
          {item.isLocked && <LockIcon className="w-4 h-4 text-gray-500" />}
          {hasChildren && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </div>
      </div>
      {hasChildren && isOpen && (
        <div className="mt-1">
          {item.children?.map(child => (
            <NavItem 
              key={child.id} 
              item={child} 
              level={level + 1} 
              openItems={openItems} 
              toggleItem={toggleItem}
              activeItemId={activeItemId}
              setActiveItemId={setActiveItemId}
            />
          ))}
        </div>
      )}
    </div>
  );
};


interface SidebarProps {
  activeItemId: string;
  setActiveItemId: (id: string) => void;
  openItems: Record<string, boolean>;
  toggleOpenItem: (id: string) => void;
}


const Sidebar: React.FC<SidebarProps> = ({ activeItemId, setActiveItemId, openItems, toggleOpenItem }) => {

  return (
    <div className="w-80 bg-primary-dark flex flex-col h-screen border-r border-border-dark">
      <div className="flex items-center h-16 px-6 border-b border-border-dark">
        <h1 className="text-xl font-bold text-white tracking-wider">
          TradeZone
          <span className="block text-xs font-light text-gray-400 -mt-1">FRONTPOINT</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <NavItem 
                item={item} 
                level={0} 
                openItems={openItems} 
                toggleItem={toggleOpenItem} 
                activeItemId={activeItemId}
                setActiveItemId={setActiveItemId}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border-dark">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-white font-semibold">Upgrade to PRO to get</p>
            <p className="text-xs text-gray-400 mb-4">access all Features!</p>
            <button className="w-full bg-accent-blue text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Upgrade
            </button>
        </div>
        <div className="flex justify-center items-center space-x-4 mt-4">
            <a href="#" className="text-gray-500 hover:text-white"><YoutubeIcon className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-white"><XIcon className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-white"><DiscordIcon className="w-5 h-5" /></a>
        </div>
        <div className="text-center mt-4 text-xs text-gray-500">
          Version 1.17.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;