/**
 * Uploads API Service
 * @see swagger.js: POST /uploads/upload-images, DELETE /uploads/delete-image
 */
import { apiClient } from "./apiClient";

const UPLOAD_IMAGES = "/uploads/upload-images";
const DELETE_IMAGE = "/uploads/delete-image";

/**
 * Upload multiple images
 * POST /uploads/upload-images (multipart/form-data)
 * @param {File[]} files - Array of image files
 * @returns {Promise<string[]|object>} - Uploaded image URLs or response data
 */
export const uploadImages = async (files) => {
  if (!files?.length) return [];
  const formData = new FormData();
  // الـ backend (multer) يتوقع الحقل "images" وليس "file" — MulterError: Unexpected field
  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i]);
  }
  const response = await apiClient.post(UPLOAD_IMAGES, formData);
  return response.data?.images ?? response.data?.data ?? response.data ?? [];
};

/**
 * Upload single image
 * @param {File} file - One image file
 * @returns {Promise<string|undefined>} - Uploaded image URL
 */
export const uploadImage = async (file) => {
  const result = await uploadImages([file]);
  return Array.isArray(result) ? result[0] : result;
};

/**
 * Delete an uploaded image
 * DELETE /uploads/delete-image (body: { imagePath } or { image_url })
 * @param {string} imagePath - Path or URL of the image to delete
 * @returns {Promise<object>} - Success response
 */
export const deleteImage = async (imagePath) => {
  const response = await apiClient.delete(DELETE_IMAGE, {
    data: { imagePath: imagePath },
  });
  return response.data?.data ?? response.data;
};
