import React from 'react';

interface HomePageProps {
    onNavigateToTrade: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToTrade }) => {
    return (
        <div className="text-center flex flex-col items-center justify-center py-20 md:py-28 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 pb-4 mb-4">
                Welcome to Stockify
            </h1>
            <p className="max-w-3xl text-lg md:text-xl text-gray-300 mb-10">
                The fantasy stock market for music. Invest virtual credits in your favorite artists, track their growth based on real-world popularity, and build your ultimate music portfolio.
            </p>
            <button
                onClick={onNavigateToTrade}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-4 px-10 rounded-full text-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-400/20"
            >
                Start Trading Now
            </button>

            <div className="mt-20 max-w-4xl w-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-8 text-left">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-3">How It Works</h2>
                        <p className="text-gray-300 leading-relaxed">
                            An artist's "stock value" is directly tied to their <strong className="text-emerald-400">Spotify follower count</strong>. When you invest, you're buying shares at their current follower level. As they gain more followers, the value of your investment increases proportionally. It's a simple, powerful way to track and capitalize on an artist's growing popularity.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-3">An Example</h2>
                        <div className="space-y-2 text-gray-300">
                            <p>1. You invest <strong className="font-bold text-white">C 1,000</strong> in Post Malone when he has <strong className="font-bold text-white">60,000,000</strong> followers.</p>
                            <p>2. He drops a new hit album, and his follower count jumps to <strong className="font-bold text-white">66,000,000</strong> followers — a <strong className="font-bold text-emerald-400">10% increase!</strong></p>
                            <p>3. Your initial investment has also grown by 10%. It's now worth <strong className="font-bold text-white">C 1,100</strong>, earning you a <strong className="font-bold text-emerald-400">C 100 profit.</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;