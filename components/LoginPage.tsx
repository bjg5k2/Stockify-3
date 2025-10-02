import React, { useState } from 'react';
import { signUpWithEmailAndPassword, signInWithEmailAndPassword } from '../services/authService';
import { createUserProfile } from '../services/firestoreService';

const LoginPage: React.FC = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSigningUp) {
        if (!displayName.trim()) {
          setError("Please enter a display name.");
          setIsLoading(false);
          return;
        }
        const userCredential = await signUpWithEmailAndPassword(email, password, displayName);
        if (userCredential?.user) {
          await createUserProfile(userCredential.user, { displayName });
        }
      } else {
        await signInWithEmailAndPassword(email, password);
      }
    } catch (err: any) {
        // Firebase provides user-friendly error messages
        setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsSigningUp(!isSigningUp);
    setError(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-8 animate-fade-in-up">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 pb-2">
                {isSigningUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-300">The fantasy stock market for music.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {isSigningUp && (
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
              <input
                type="text" id="displayName" value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="e.g., MusicMogul" required
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email" id="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="you@example.com" required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="••••••••" required
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-4 text-center bg-red-900/30 p-2 rounded-md">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/20 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 flex items-center justify-center"
          >
            {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isLoading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={toggleForm} className="font-medium text-emerald-400 hover:text-emerald-300 ml-1">
            {isSigningUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;