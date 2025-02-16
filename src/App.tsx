import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AdminDashboard from './components/AdminDashboard';
import PublicPage from './components/PublicPage';

function App() {
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session?.user);
    });
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
        <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="text-sage-600 font-semibold text-lg">
              Bébé Sawadogo
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sage-600 hover:text-sage-700 font-medium"
              >
                Dashboard Admin
              </Link>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleLogin} className="bg-white/40 backdrop-blur-sm p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Login</h2>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-sage-200 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 focus:ring-opacity-50 focus:outline-none hover:border-sage-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-lg border border-sage-200 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 focus:ring-opacity-50 focus:outline-none hover:border-sage-300"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-sage-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-sage-700 hover:shadow-lg transition-all duration-200 mt-6"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;