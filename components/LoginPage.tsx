import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin(username.trim());
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
            <div className="text-center animate-fade-in-up w-full max-w-md">
                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 pb-4 mb-4">
                    Stockify
                </h1>
                <p className="max-w-3xl text-lg md:text-xl text-gray-300 mb-10 mx-auto">
                    The fantasy stock market for music. Enter a username to start building your portfolio.
                </p>
                <form onSubmit={handleSubmit} className="w-full">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg py-3 px-4 text-white text-center text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
                        maxLength={20}
                    />
                    <button
                        type="submit"
                        disabled={!username.trim()}
                        className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-10 rounded-lg text-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-400/20 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                    >
                        Start Playing
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;