import React from 'react';
import { RefreshIcon } from './icons';

type Page = 'home' | 'trade' | 'portfolio';

interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    userCredits: number;
    netWorth: number;
    username: string;
    onReset: () => void;
}

const NavLink: React.FC<{
    page: Page,
    currentPage: Page,
    onClick: (page: Page) => void,
    children: React.ReactNode
}> = ({ page, currentPage, onClick, children }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onClick(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
        >
            {children}
        </button>
    );
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, userCredits, netWorth, username, onReset }) => {
    return (
        <header className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-700/50 fixed top-0 left-0 right-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-8">
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                            Stockify
                        </div>
                        <nav className="hidden md:flex items-center space-x-2">
                           <NavLink page="home" currentPage={currentPage} onClick={onNavigate}>Home</NavLink>
                           <NavLink page="trade" currentPage={currentPage} onClick={onNavigate}>Trade</NavLink>
                           <NavLink page="portfolio" currentPage={currentPage} onClick={onNavigate}>Portfolio</NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                             <div className="text-xs text-gray-400">Net Worth</div>
                             <div className="text-md font-semibold text-white">{formatCurrency(netWorth)}</div>
                        </div>
                         <div className="text-right">
                             <div className="text-xs text-gray-400">Credits</div>
                             <div className="text-md font-semibold text-emerald-400">{formatCurrency(userCredits)}</div>
                        </div>
                        <div className="flex items-center space-x-2 pl-2 border-l border-gray-700">
                             <div className="text-right">
                                <div className="text-sm font-medium text-white">{username}</div>
                             </div>
                             <button onClick={onReset} title="Reset Game" className="bg-gray-700/80 hover:bg-red-500/50 text-gray-300 hover:text-white p-2 rounded-full transition-colors">
                                <RefreshIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;