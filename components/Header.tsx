import React from 'react';
import { SignOutIcon } from './icons';
// Fix: Import the shared Page type.
import { Page } from '../types';

// Fix: Removed local Page type to use the shared one from types.ts.
// type Page = 'home' | 'trade' | 'portfolio' | 'leaderboard';

interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    userCredits: number;
    netWorth: number;
    username: string;
    onSignOut: () => void;
}

const NavItem: React.FC<{ page: Page; currentPage: Page; onNavigate: (page: Page) => void; children: React.ReactNode }> = ({ page, currentPage, onNavigate, children }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onNavigate(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
        >
            {children}
        </button>
    );
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, userCredits, netWorth, username, onSignOut }) => {
    const formatCredits = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/50 backdrop-blur-lg border-b border-gray-700/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                             <span className="text-xl font-bold text-white">Stockify</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-4">
                            <NavItem page="home" currentPage={currentPage} onNavigate={onNavigate}>Home</NavItem>
                            <NavItem page="trade" currentPage={currentPage} onNavigate={onNavigate}>Trade</NavItem>
                            <NavItem page="portfolio" currentPage={currentPage} onNavigate={onNavigate}>Portfolio</NavItem>
                            <NavItem page="faq" currentPage={currentPage} onNavigate={onNavigate}>FAQs</NavItem>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                             <p className="text-xs text-gray-400">Net Worth</p>
                             <p className="text-sm font-bold text-white">{formatCredits(netWorth)}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-700"></div>
                        <div className="text-right">
                             <p className="text-xs text-gray-400">Credits</p>
                             <p className="text-sm font-bold text-emerald-400">{formatCredits(userCredits)}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-700"></div>
                        <button onClick={onSignOut} title="Sign Out" className="text-gray-400 hover:text-white transition-colors">
                            <SignOutIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
             {/* Mobile Nav */}
            <nav className="md:hidden flex items-center justify-around p-2 bg-gray-900/80 border-t border-gray-700/50 fixed bottom-0 left-0 right-0">
                <NavItem page="home" currentPage={currentPage} onNavigate={onNavigate}>Home</NavItem>
                <NavItem page="trade" currentPage={currentPage} onNavigate={onNavigate}>Trade</NavItem>
                <NavItem page="portfolio" currentPage={currentPage} onNavigate={onNavigate}>Portfolio</NavItem>
                <NavItem page="faq" currentPage={currentPage} onNavigate={onNavigate}>FAQs</NavItem>
            </nav>
        </header>
    );
};

export default Header;