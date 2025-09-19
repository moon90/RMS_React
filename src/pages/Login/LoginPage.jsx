import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

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
      await login(userName, password);
      toast.success('Login successful!');
      navigate('/dashboard');
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
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
      <div
        className="flex items-center justify-center min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/images/restaurant-bg.jpg')" }}
      >
        <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-90 rounded-lg shadow-2xl">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-800">Welcome Back</h2>
            <p className="mt-2 text-[#424242]">Sign in to continue to your restaurant dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 font-medium text-white bg-[#E65100] rounded-lg hover:bg-[#D84315] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E65100] disabled:opacity-50 transition-colors duration-300"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              render={renderProps => (
                <button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  className="w-full flex justify-center py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-300"
                >
                  Sign in with Google
                </button>
              )}
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
