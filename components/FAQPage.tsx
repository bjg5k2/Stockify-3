import React from 'react';

const FAQPage: React.FC = () => {
    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
             <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 pb-4 mb-8 text-center">
                Frequently Asked Questions
            </h1>

            <div className="space-y-8">
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-3">How It Works</h2>
                    <p className="text-gray-300 leading-relaxed">
                        An artist's "stock value" is directly tied to their <strong className="text-emerald-400">Spotify follower count</strong>. When you invest, you're buying shares at their current follower level. As they gain more followers, the value of your investment increases proportionally. It's a simple, powerful way to track and capitalize on an artist's growing popularity.
                    </p>
                </div>

                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-3">An Example</h2>
                    <div className="space-y-2 text-gray-300">
                        <p>1. You invest <strong className="font-bold text-white">C 1,000</strong> in Post Malone when he has <strong className="font-bold text-white">60,000,000</strong> followers.</p>
                        <p>2. He drops a new hit album, and his follower count jumps to <strong className="font-bold text-white">66,000,000</strong> followers — a <strong className="font-bold text-emerald-400">10% increase!</strong></p>
                        <p>3. Your initial investment has also grown by 10%. It's now worth <strong className="font-bold text-white">C 1,100</strong>, earning you a <strong className="font-bold text-emerald-400">C 100 profit.</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;