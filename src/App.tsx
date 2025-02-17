import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AdminDashboard from './components/AdminDashboard';
import PublicPage from './components/PublicPage';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { useTheme } from './lib/theme/ThemeContext';
import { LogOut, LogIn } from 'lucide-react';
import { useLanguage } from './lib/i18n/LanguageContext';

function App() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useLanguage();

  React.useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session?.user);
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-primary font-semibold text-lg">
            Bébé Sawadogo
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            {isAdmin ? (
              <>
                <ThemeCustomizer />
                <Link
                  to="/admin"
                  className="text-primary hover:text-secondary font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Dashboard Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                  title={t('auth.logout')}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">{t('auth.logout')}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                title={t('auth.login')}
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden md:inline">{t('auth.login')}</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleLogin} className="bg-white/40 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-text mb-6">Admin Login</h2>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-gray-200 focus:outline-none hover:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-gray-200 focus:outline-none hover:border-primary"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-all duration-200 mt-6 disabled:opacity-50 active:transform active:scale-[0.98]"
          >
            {isSubmitting ? 'Connecting...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;