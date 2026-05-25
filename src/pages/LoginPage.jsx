import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaLock, FaUtensils, FaArrowRight } from 'react-icons/fa';

export default function LoginPage() {
  const { login } = useContext(AuthContext);

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await login(userName, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left Side - Hero Panel */}
      <div className="hidden lg:flex lg:w-3/5 bg-indigo-700 relative overflow-hidden flex-col justify-between p-16">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl">
              <FaUtensils className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">RMS.</h1>
          </div>
          
          <h2 className="text-6xl font-black text-white leading-tight tracking-tighter mb-8 max-w-xl">
            Modern Management <br/>
            <span className="text-indigo-200">For Modern Dining.</span>
          </h2>
          <p className="text-indigo-100/60 text-lg font-bold italic max-w-md leading-relaxed">
            Standardize your operations, optimize your inventory, and deliver exceptional dining experiences with our integrated suite.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">500+</span>
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Active Nodes</span>
            </div>
            <div className="w-px h-10 bg-indigo-500/50"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">99.9%</span>
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Uptime Record</span>
            </div>
          </div>
          
          <footer className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
            © 2026 RMS TECHNOLOGY SOLUTIONS · PRIVACY POLICY
          </footer>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Welcome Back</h3>
            <p className="text-slate-400 font-bold text-sm">Please enter your credentials to access the system.</p>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <p className="text-xs font-black text-red-600 uppercase tracking-widest">{error}</p>
              </div>
            )}
            
            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-indigo-600 transition-colors">Username</label>
              <div className="relative">
                <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. admin_node_01"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-indigo-600 transition-colors">Password</label>
              <div className="relative">
                <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" id="remember" />
                  <div className="w-5 h-5 border-2 border-slate-200 rounded-md peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                  <FaUtensils className="absolute inset-0 m-auto text-[10px] text-white opacity-0 peer-checked:opacity-100" />
                </div>
                <label htmlFor="remember" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group-hover:text-slate-600 transition-colors">Remember Node</label>
              </div>
              <a href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-2xl shadow-indigo-500/20 hover:bg-indigo-800 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Authenticate Node <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Don’t have access? <a href="#" className="text-indigo-600 hover:text-indigo-700 transition-colors border-b border-indigo-100 pb-1 ml-1">Request Node Assignment</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}