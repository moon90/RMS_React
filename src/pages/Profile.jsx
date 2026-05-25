import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserById, updateUser, uploadProfilePicture } from '../services/userService';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave } from 'react-icons/fi';

import UserProfilePictureUpload from '../components/UserProfilePictureUpload';

const Profile = () => {
  const { user, login, setUser } = useAuth(); // Need login/setUser logic or just refresh window
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = user?.userID || user?.id;
        if (!userId) return;
        
        const response = await getUserById(userId);
        const data = response.data?.data || response.data;
        
        if (data) {
          setFormData({
            userName: data.userName || data.username || '',
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || data.phoneNumber || '',
            address: data.address || '',
            profilePictureUrl: data.profilePicture || data.profilePictureUrl || '',
            status: data.status ?? true
          });
          
          let storedUser = JSON.parse(localStorage.getItem('user')) || {};
          if (data.profilePicture && storedUser.profilePicture !== data.profilePicture) {
            storedUser = { ...storedUser, profilePicture: data.profilePicture };
            localStorage.setItem('user', JSON.stringify(storedUser));
            if (setUser) setUser(storedUser);
          }
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userId = user?.userID || user?.id;
      const payload = {
          ...formData,
          userID: userId
      };

      const response = await updateUser(userId, payload);
      
      if (response.data.isSuccess || response.data) {
        toast.success("Profile updated successfully!");
        
        // Update local storage user object so header updates immediately
        let storedUser = JSON.parse(localStorage.getItem('user')) || {};
        storedUser = { ...storedUser, ...formData };
        localStorage.setItem('user', JSON.stringify(storedUser));
        setUser(storedUser);
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred while updating profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = user?.userID || user?.id;
    if (!userId) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setLoading(true);
      const response = await uploadProfilePicture(userId, uploadData);
      if (response.data.isSuccess) {
        toast.success('Profile picture updated!');
        
        // Fetch the fresh user data to get the base64 image
        const freshUserResponse = await getUserById(userId);
        const freshData = freshUserResponse.data?.data || freshUserResponse.data;
        
        if (freshData && freshData.profilePicture) {
           setFormData(prev => ({ ...prev, profilePictureUrl: freshData.profilePicture }));
           
           let storedUser = JSON.parse(localStorage.getItem('user')) || {};
           storedUser = { ...storedUser, profilePicture: freshData.profilePicture };
           localStorage.setItem('user', JSON.stringify(storedUser));
           setUser(storedUser); // Instantly update header context
        }
      } else {
        toast.error(response.data.message || 'Failed to upload picture');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800"></div>
        
        <div className="px-8 pb-8 relative">
          {/* Beautiful Avatar Profile Picture */}
          <div className="absolute -top-16 left-8 bg-white p-2 rounded-2xl shadow-lg group relative">
            <div className="w-32 h-32 rounded-xl overflow-hidden relative bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              {formData.profilePictureUrl ? (
                <img src={formData.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-gray-300">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
              
              {/* Hover Overlay */}
              <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                <div className="text-white flex flex-col items-center">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-semibold">Upload</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loading} />
              </label>
            </div>
          </div>

          <div className="mt-24 flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">{formData.fullName || formData.userName || 'Loading...'}</h1>
              <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mt-1">System User</p>
            </div>
          </div>

          <hr className="mb-8 border-gray-100" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiUser className="text-gray-400" /> Full Name
                </label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiUser className="text-gray-400" /> Username
                </label>
                <input 
                  type="text" 
                  name="userName"
                  value={formData.userName}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                  placeholder="Enter username"
                  readOnly 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiMail className="text-gray-400" /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiPhone className="text-gray-400" /> Phone Number
                </label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiMapPin className="text-gray-400" /> Address
                </label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Enter full address"
                ></textarea>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Profile;
