import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Import assets
import logoNew from '../../assets/images/logo_new.png';
import foodBg from '../../assets/images/food_bg.png';

const LoginPage = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(userName, password);
      if (result?.success) {
        const loginData = result?.data;
        const tokenFromResponse = loginData?.accessToken ?? loginData?.access_token ?? loginData?.token;
        if (!localStorage.getItem('accessToken') && tokenFromResponse) {
          localStorage.setItem('accessToken', tokenFromResponse);
        }
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result?.message || 'Login failed.');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log(credentialResponse);
    // Here you would send credentialResponse.credential (the ID token) to your backend
    // for verification and authentication.
    toast.info('Google login successful! (Backend integration pending)');
    // Example: await loginWithGoogle(credentialResponse.credential);
  };

  const handleGoogleError = () => {
    toast.error('Google login failed.');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <div
        className="relative flex items-center justify-center min-h-screen bg-cover bg-center font-inter"
        style={{ backgroundImage: `url(${foodBg})` }}
      >
        {/* Warm Overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 to-yellow-500/20 backdrop-blur-[2px]"></div>

        <div className="relative z-10 w-full max-w-lg px-4">
          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transform transition-all duration-500 hover:scale-[1.01]">
            <div className="bg-[#DA291C] h-2 w-full"></div>

            <div className="p-8 md:p-12">
              {/* Logo Section */}
              <div className="flex flex-col items-center mb-10">
                <div className="w-32 h-32 md:w-40 md:h-40 p-1 bg-white rounded-full shadow-lg flex items-center justify-center -mt-16 md:-mt-20 border-4 border-[#FFC72C]">
                  <img src={logoNew} alt="Restaurant Brno Logo" className="w-full h-full object-contain rounded-full" />
                </div>
                <h1 className="mt-6 text-3xl font-black text-[#DA291C] uppercase tracking-tighter">Restaurant Brno</h1>
                <p className="text-gray-500 font-medium tracking-wide">Digital Management Portal</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FFC72C] focus:bg-white focus:ring-4 focus:ring-[#FFC72C]/10 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#FFC72C] focus:bg-white focus:ring-4 focus:ring-[#FFC72C]/10 outline-none transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full h-16 bg-[#DA291C] text-white rounded-2xl font-black text-xl uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-[#B71C1C] hover:shadow-2xl active:scale-[0.97] transition-all duration-200 disabled:opacity-50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isSubmitting ? 'Serving...' : 'Sign In'}
                    {!isSubmitting && <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                  </span>
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </form>

              <div className="relative flex items-center justify-center my-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative px-6 bg-white text-gray-400 font-bold text-xs uppercase tracking-widest">Connect With</div>
              </div>

              <div className="flex justify-center transform transition-all duration-200 hover:scale-105">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="circle"
                  text="signin_with"
                  width="100%"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
              <p className="text-gray-400 text-sm font-medium">Developed for <span className="text-[#DA291C] font-bold">Brno Hospitality Group</span></p>
            </div>
          </div>

          <p className="mt-8 text-center text-white/80 text-sm font-semibold tracking-wide drop-shadow-md">
            &copy; 2026 Admin Panel &bull; Fast. Fresh. Digital.
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
