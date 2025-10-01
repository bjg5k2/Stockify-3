import React from 'react';
import { LogoutIcon } from './icons';

export type Page = 'home' | 'portfolio' | 'trade' | 'artistDetail';

interface HeaderProps {
    userCredits: number;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onLogout: () => void;
    netWorth: number;
}

const Header: React.FC<HeaderProps> = ({ userCredits, currentPage, onNavigate, onLogout, netWorth }) => {

    const NavLink: React.FC<{ page: Page; label: string }> = ({ page, label }) => {
        const isActive = currentPage === page;
        return (
            <button
                onClick={() => onNavigate(page)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
            >
                {label}
            </button>
        );
    };

    const formatCredits = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
    }

    return (
        <header className="sticky top-0 z-40 bg-gray-900/60 backdrop-blur-lg border-b border-gray-700/50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('home')}>
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                                Stockify
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-4">
                                <NavLink page="home" label="Home" />
                                <NavLink page="portfolio" label="Portfolio" />
                                <NavLink page="trade" label="Trade" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                             <span className="text-xs text-gray-400 block">Net Worth</span>
                             <span className="font-semibold text-white">{formatCredits(netWorth)}</span>
                        </div>
                         <div className="w-px h-8 bg-gray-700"></div>
                        <div className="text-right">
                            <span className="text-xs text-gray-400 block">Available Credits</span>
                            <span className="font-semibold text-emerald-400">{formatCredits(userCredits)}</span>
                        </div>
                        <button onClick={onLogout} title="Reset Session" className="text-gray-400 hover:text-white transition-colors">
                            <LogoutIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                 {/* Mobile Nav */}
                <div className="md:hidden flex justify-center space-x-2 py-2">
                    <NavLink page="home" label="Home" />
                    <NavLink page="portfolio" label="Portfolio" />
                    <NavLink page="trade" label="Trade" />
                </div>
            </nav>
        </header>
    );
};

export default Header;