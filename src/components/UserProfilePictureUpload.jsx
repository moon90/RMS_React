import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { validateImage } from '../utils/imageValidation';
import { uploadProfilePicture, getUserById, updateUser } from '../services/userService';
import { FaCamera, FaTrashAlt, FaCloudUploadAlt, FaUserCircle } from 'react-icons/fa';

const UserProfilePictureUpload = ({ userId, currentImageUrl, onUploadSuccess, onRemoveSuccess, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validationResult = validateImage(file);
      if (!validationResult.isValid) {
        toast.error(validationResult.message);
        e.target.value = null;
        setSelectedFile(null);
        setPreviewUrl(currentImageUrl);
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // If we are in "Add Mode" (no userId), pass the file back to parent
      if (!userId && onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await uploadProfilePicture(userId, formData);
      if (response.data.isSuccess) {
        toast.success('Biometric data synchronized.');
        setPreviewUrl(response.data.data);
        setSelectedFile(null);
        if (onUploadSuccess) onUploadSuccess(response.data.data);
      } else {
        toast.error(response.data.message || 'Synchronization failed.');
      }
    } catch (error) {
      toast.error('An error occurred during network transmission.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!userId) {
      // If adding, just clear the selection
      setSelectedFile(null);
      setPreviewUrl(null);
      if (onFileSelect) onFileSelect(null);
      return;
    }

    setLoading(true);
    try {
      const userResponse = await getUserById(userId);
      if (userResponse.data.isSuccess) {
        const updatePayload = { ...userResponse.data.data, profilePictureUrl: '' };
        const response = await updateUser(userId, updatePayload);
        if (response.data.isSuccess) {
          toast.success('Biometric data purged.');
          setPreviewUrl(null);
          setSelectedFile(null);
          if (onRemoveSuccess) onRemoveSuccess();
        }
      }
    } catch (error) {
      toast.error('Purge failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center group">
      <div className="relative mb-6">
        <div 
          className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl ring-8 ring-gray-50 group-hover:ring-blue-50 transition-all cursor-pointer relative bg-gray-50 flex items-center justify-center"
          onClick={triggerFileInput}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="flex flex-col items-center text-gray-300">
              <FaUserCircle size={60} />
              <span className="text-[10px] font-black uppercase tracking-widest mt-2">No Image</span>
            </div>
          )}
          
          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <FaCamera size={30} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Update Photo</span>
          </div>
        </div>

        {/* Floating Actions */}
        {(previewUrl || selectedFile) && (
          <div className="absolute -bottom-2 -right-2 flex gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className="w-10 h-10 bg-white text-red-500 rounded-2xl shadow-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-gray-100"
              title="Remove Image"
            >
              <FaTrashAlt size={14} />
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Immediate Upload Button (Only for Edit mode) */}
      {selectedFile && userId && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all animate-bounce-subtle"
        >
          {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FaCloudUploadAlt />}
          Sync Photo
        </button>
      )}

      {!userId && selectedFile && (
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Photo Buffered for Enrollment</p>
      )}
    </div>
  );
};

export default UserProfilePictureUpload;
