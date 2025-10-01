import React from 'react';

// Moved constant here to remove dependency on separate file
const INITIAL_USER_CREDITS = 10000;

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    return (
        <div className="flex items-center justify-center min-h-screen text-center p-4 animate-fade-in-up">
            <div className="max-w-lg">
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 pb-2 mb-4">
                    Welcome to Stockify
                </h1>
                <p className="text-lg text-gray-300 mb-8">
                    The fantasy stock market for music. Invest in artists, track their growth, and build your portfolio. Your session is saved in your browser.
                </p>
                <button
                    onClick={onLogin}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-400/20"
                >
                    Start Playing
                </button>
                <p className="text-xs text-gray-500 mt-8">
                    This is a simulation game. No real money is involved. All data is for entertainment purposes. You will start with C {INITIAL_USER_CREDITS.toLocaleString()} credits.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
