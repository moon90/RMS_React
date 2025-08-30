import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { validateImage } from '../utils/imageValidation';
import { uploadProfilePicture, getUserById, updateUser } from '../services/userService'; // Assuming these exist or will be created

const UserProfilePictureUpload = ({ userId, currentImageUrl, onUploadSuccess, onRemoveSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validationResult = validateImage(file);
      if (!validationResult.isValid) {
        toast.error(validationResult.message);
        e.target.value = null; // Clear the file input
        setSelectedFile(null);
        setPreviewUrl(currentImageUrl); // Revert preview to current image
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(currentImageUrl); // Revert preview to current image
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.info('Please select a file to upload.');
      return;
    }
    if (!userId) {
      toast.error('User ID is required to upload profile picture.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await uploadProfilePicture(userId, formData);
      if (response.data.isSuccess) {
        toast.success('Profile picture uploaded successfully!');
        setPreviewUrl(response.data.data); // Update preview with new URL from backend
        setSelectedFile(null); // Clear selected file
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data); // Pass new URL to parent
        }
      } else {
        toast.error(response.data.message || 'Failed to upload profile picture.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred during upload.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!userId) {
      toast.error('User ID is required to remove profile picture.');
      return;
    }

    setLoading(true);
    try {
      // To remove, we can send an update request with an empty/null profilePictureUrl
      // This assumes your backend's UpdateUser endpoint can handle clearing the URL
      // Alternatively, you might have a dedicated DELETE endpoint for profile pictures.
      // For now, let's assume UpdateUser can handle it by sending an empty string for profilePictureUrl
      
      // First, get the current user data to ensure we only update the profile picture URL
      const userResponse = await getUserById(userId);
      if (!userResponse.data.isSuccess || !userResponse.data.data) {
        toast.error('Failed to fetch user data for removal.');
        setLoading(false);
        return;
      }
      const userData = userResponse.data.data;

      const updatePayload = { ...userData, profilePictureUrl: '' }; // Clear the URL
      const response = await updateUser(userId, updatePayload);

      if (response.data.isSuccess) {
        toast.success('Profile picture removed successfully!');
        setPreviewUrl(null);
        setSelectedFile(null);
        if (onRemoveSuccess) {
          onRemoveSuccess();
        }
      } else {
        toast.error(response.data.message || 'Failed to remove profile picture.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred during removal.');
      console.error('Remove error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label htmlFor="profilePictureInput" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
      <input
        type="file"
        id="profilePictureInput"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      <div className="mt-2 flex items-center space-x-4">
        <img src={previewUrl || '/images/default-profile.png'} alt="Profile Preview" className="h-32 w-32 object-cover rounded-full shadow-md" />
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
          >
            {loading ? 'Removing...' : 'Remove Picture'}
          </button>
        )}
      </div>

      {selectedFile && !loading && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          {loading ? 'Uploading...' : 'Upload New Picture'}
        </button>
      )}
    </div>
  );
};

export default UserProfilePictureUpload;
