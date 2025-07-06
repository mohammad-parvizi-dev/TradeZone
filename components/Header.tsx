
import React from 'react';
import { SearchIcon, BellIcon, SettingsIcon, ExpandIcon, MenuIcon } from './icons';

interface HeaderProps {
  breadcrumbs: string[];
}

const Header: React.FC<HeaderProps> = ({ breadcrumbs }) => {
  return (
    <header className="flex-shrink-0 bg-primary-dark border-b border-border-dark">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2 text-sm">
           {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className={index === breadcrumbs.length - 1 ? 'text-light-gray' : 'text-gray-500'}>
                {crumb}
              </span>
              {index < breadcrumbs.length - 1 && <span className="text-gray-500">/</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-gray" />
            <input
              type="text"
              placeholder="Search"
              className="bg-secondary-dark border border-border-dark rounded-lg py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-gray-700">
            <BellIcon className="w-6 h-6 text-accent-gray" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            <SettingsIcon className="w-6 h-6 text-accent-gray" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            <ExpandIcon className="w-6 h-6 text-accent-gray" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-700">
            <MenuIcon className="w-6 h-6 text-accent-gray" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
