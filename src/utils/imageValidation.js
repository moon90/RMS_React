// imageValidation.js

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE_MB = 5; // Corresponds to backend setting

export const validateImage = (file) => {
  if (!file) {
    return { isValid: false, message: 'No file selected.' };
  }

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { isValid: false, message: `Invalid file type. Allowed types are: ${ALLOWED_IMAGE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}.` };
  }

  // Validate file size
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { isValid: false, message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE_MB} MB.` };
  }

  return { isValid: true, message: 'Image is valid.' };
};