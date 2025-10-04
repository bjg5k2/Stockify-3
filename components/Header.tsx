import React from 'react';
import { Page } from '../types';
import { SignOutIcon } from './icons';

interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    username: string;
    userCredits: number;
    onSignOut: () => void;
    simulationStartDate: number;
    simulatedDays: number;
}

const NavLink: React.FC<{
    page: Page;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    children: React.ReactNode;
}> = ({ page, currentPage, onNavigate, children }) => {
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
};

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, username, userCredits, onSignOut, simulationStartDate, simulatedDays }) => {
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
    };

    const getSimulatedDate = () => {
        const date = new Date(simulationStartDate);
        date.setDate(date.getDate() + simulatedDays);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <header className="bg-gray-900/50 backdrop-blur-md sticky top-0 z-40 border-b border-gray-700/80 mb-8">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 text-white text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                           Stockify
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <NavLink page="home" currentPage={currentPage} onNavigate={onNavigate}>Home</NavLink>
                                <NavLink page="portfolio" currentPage={currentPage} onNavigate={onNavigate}>Portfolio</NavLink>
                                <NavLink page="trade" currentPage={currentPage} onNavigate={onNavigate}>Trade</NavLink>
                                <NavLink page="leaderboard" currentPage={currentPage} onNavigate={onNavigate}>Leaderboard</NavLink>
                                <NavLink page="faq" currentPage={currentPage} onNavigate={onNavigate}>FAQ</NavLink>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                         <div className="text-right mr-4">
                            <div className="text-sm text-white">{username}</div>
                            <div className="text-md font-bold text-emerald-400">{formatCurrency(userCredits)}</div>
                        </div>
                        <div className="hidden sm:block text-right mr-4 border-r border-gray-700 pr-4">
                            <div className="text-xs text-gray-400">Simulated Date</div>
                            <div className="text-sm font-semibold text-gray-200">{getSimulatedDate()}</div>
                        </div>
                        <button onClick={onSignOut} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span className="sr-only">Sign out</span>
                            <SignOutIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
