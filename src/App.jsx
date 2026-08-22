import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoon, FaSun, FaHeart, FaUserFriends, FaHome, FaUser, FaBell } from 'react-icons/fa';
import Feed from './Feed';
import Friends from './Friends';
import Profile from './Profile';
import Notifications from './Notifications';

function App() {
  const [theme, setTheme] = useState('barbie');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('feed');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) setIsLoggedIn(true);
  }, [token]);

  const toggleTheme = () => {
    const newTheme = theme === 'barbie' ? 'dark' : 'barbie';
    setTheme(newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!isLogin) {
        if (!formData.email.endsWith('@gmail.com')) {
            setMessage('❌ Please use a valid @gmail.com email address');
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,10}$/;
        if (!passwordRegex.test(formData.password)) {
            setMessage('❌ Password must be 6-10 chars, include 1 uppercase, 1 lowercase, and 1 number');
            return;
        }
    }

    try {
            const url = isLogin 
        ? 'https://social-network-backend-clean.vercel.app/api/auth/login' 
        : 'https://social-network-backend-clean.vercel.app/api/auth/register';
      const res = await axios.post(url, formData);
      setMessage(`✅ ${res.data.message}`);
      if (isLogin && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.data.id);
        setIsLoggedIn(true);
      }
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.error || 'Something went wrong'}`);
    }
  };

  if (isLoggedIn) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-darkbg text-white' : 'bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 text-gray-800'}`}>
        <div className="p-4 flex flex-wrap justify-between items-center max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-2xl font-bold text-barbie cursor-pointer" onClick={() => setView('feed')}>
              <FaHeart /> SocialHub
            </div>
            <div className="flex flex-wrap gap-2 text-lg">
              <button onClick={() => setView('feed')} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${view === 'feed' ? 'bg-barbie text-white' : 'text-gray-600 dark:text-gray-300 hover:text-barbie'}`}>
                <FaHome /> Feed
              </button>
              <button onClick={() => setView('friends')} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${view === 'friends' ? 'bg-barbie text-white' : 'text-gray-600 dark:text-gray-300 hover:text-barbie'}`}>
                <FaUserFriends /> Friends
              </button>
              <button onClick={() => setView('profile')} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${view === 'profile' ? 'bg-barbie text-white' : 'text-gray-600 dark:text-gray-300 hover:text-barbie'}`}>
                <FaUser /> Profile
              </button>
              <button onClick={() => setView('notifications')} className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${view === 'notifications' ? 'bg-barbie text-white' : 'text-gray-600 dark:text-gray-300 hover:text-barbie'}`}>
                <FaBell /> Notifications
              </button>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold shadow-md text-sm">
            Logout
          </button>
        </div>
        
        {view === 'feed' && <Feed />}
        {view === 'friends' && <Friends />}
        {view === 'profile' && <Profile />}
        {view === 'notifications' && <Notifications />}

        <button onClick={toggleTheme} className="fixed top-24 right-6 p-3 rounded-full shadow-lg bg-white/80 dark:bg-darkcard hover:scale-110 transition-transform text-2xl z-50">
          {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-darkbg text-white' : 'bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 text-gray-800'}`}>
      
      {/* Moon/Sun Toggle for Login Page */}
      <button onClick={toggleTheme} className="absolute top-6 right-6 p-3 rounded-full shadow-lg bg-white/80 dark:bg-darkcard hover:scale-110 transition-transform text-2xl z-50">
        {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
      </button>

      <div className={`w-full max-w-md p-10 rounded-3xl shadow-2xl backdrop-blur-sm ${theme === 'dark' ? 'bg-darkcard border border-gray-700' : 'bg-white/60 border border-white/40'}`}>
        <div className="text-center mb-8">
          <div className="flex justify-center text-4xl mb-2 text-barbie"><FaHeart /></div>
          <h1 className="text-4xl font-bold tracking-tight">SocialHub</h1>
          <p className="text-sm opacity-70 mt-1">{isLogin ? 'Welcome back, glamorous!' : 'Join the glamour!'}</p>
        </div>
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {!isLogin && (
            <input type="text" name="username" placeholder="Username (min 3 chars)" onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-pink-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-barbie dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
          )}
          <input type="email" name="email" placeholder="Email (must be @gmail.com)" onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-pink-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-barbie dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
          <input type="password" name="password" placeholder="Password (6-10 chars, Upper/Lower/Number)" onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-pink-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-barbie dark:text-white placeholder-gray-500 dark:placeholder-gray-400" required />
          <button type="submit" className="w-full py-3 bg-barbie hover:bg-barbie-dark text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02]">{isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
        {message && <div className="mt-4 text-center font-medium text-sm">{message}</div>}
        <p className="mt-6 text-center text-sm opacity-70">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-barbie-dark hover:underline">{isLogin ? 'Sign Up' : 'Sign In'}</button>
        </p>
      </div>
    </div>
  );
}

export default App;