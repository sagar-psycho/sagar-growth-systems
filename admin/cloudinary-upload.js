import { cloudinaryConfig } from './cloudinary-config.js';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file) {
  if (!file) {
    throw new Error('Please choose an image file.');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, or WebP images are supported.');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image must be smaller than 5 MB.');
  }
}

function normalizeUploadResponse(data) {
  return {
    url: data.secure_url || data.url || '',
    publicId: data.public_id || '',
    width: typeof data.width === 'number' ? data.width : null,
    height: typeof data.height === 'number' ? data.height : null
  };
}

export function uploadImage(file, options = {}) {
  validateFile(file);

  const { folder = 'portfolio/blogs' } = options;

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && options.onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        options.onProgress(percentage);
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(normalizeUploadResponse(response));
        } catch (error) {
          reject(new Error('Unable to upload image. Please try again.'));
        }
      } else {
        reject(new Error('Unable to upload image. Please try again.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Unable to upload image. Please try again.'));
    };

    xhr.send(formData);
  });
}
