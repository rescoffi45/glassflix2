import React, { useState } from 'react';
import { X, User, Lock, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType, Language } from '../types';
import { translations } from '../utils/i18n';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserType) => void;
  language: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, language }) => {
  const t = translations[language];
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for effect
    setTimeout(() => {
      if (mode === 'signup') {
        const result = authService.signup(username, password);
        if (result.success && result.user) {
          onLogin(result.user);
          onClose();
        } else {
          setError(result.message || 'Signup failed');
        }
      } else {
        const result = authService.login(username, password);
        if (result.success && result.user) {
          onLogin(result.user);
          onClose();
        } else {
          setError(result.message || 'Login failed');
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden animate-scale-in">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-white/10 mb-4 shadow-lg">
              {mode === 'login' ? (
                <LogIn size={32} className="text-indigo-400" />
              ) : (
                <UserPlus size={32} className="text-purple-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? t.welcomeBack : t.createAccount}
            </h2>
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? t.enterCredentials : t.startJourney}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t.username}</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">{t.password}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center animate-pulse">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`
                w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg mt-2 transition-all transform hover:scale-[1.02]
                ${mode === 'login' 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-900/20' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/20'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {loading ? t.processing : (
                <>
                  {mode === 'login' ? t.signIn : t.createAccount}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? t.noAccount : t.hasAccount}
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="ml-2 font-bold text-white hover:underline"
              >
                {mode === 'login' ? t.signUp : t.signIn}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;