// utils/imageUpload.js
import imagekit from "../config/imagekitConfig.js";
import fs from "fs";
import path from "path";

/**
 * Upload file to ImageKit
 * @param {Object} file - Multer file object
 * @param {String} folder - Folder path in ImageKit
 * @param {Object} options - Additional ImageKit options
 * @returns {Object} - Returns {url, fileId, fileName, thumbnailUrl}
 */
// utils/imageUpload.js (update the uploadToImageKit function)
export const uploadToImageKit = async (
  file,
  folder = "products",
  options = {}
) => {
  try {
    if (!file || !file.path) {
      throw new Error("No file provided for upload");
    }

    const fileContent = fs.readFileSync(file.path);
    const fileName = options.fileName || file.originalname;

    // Check file type and set appropriate tags
    let tags = [];
    if (file.mimetype.startsWith("video/")) {
      tags = ["video"];
    } else if (file.mimetype.startsWith("image/")) {
      tags = ["image"];
    }

    const uploadOptions = {
      file: fileContent,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: tags,
      ...options,
    };

    // Add specific handling for video files
    if (
      file.mimetype === "video/quicktime" ||
      file.originalname.endsWith(".mov")
    ) {
      uploadOptions.fileType = "video";
    }

    const response = await imagekit.upload(uploadOptions);

    // Clean up the temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      url: response.url,
      fileId: response.fileId,
      fileName: response.name,
      thumbnailUrl: response.thumbnailUrl,
      width: response.width,
      height: response.height,
      size: response.size,
      fileType: response.fileType,
      mimeType: file.mimetype,
    };
  } catch (error) {
    console.error("ImageKit upload error:", error);

    // Clean up temp file on error
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete file from ImageKit
 * @param {String} fileId - ImageKit file ID
 * @returns {Boolean} - Success status
 */
export const deleteFromImageKit = async (fileId) => {
  try {
    if (!fileId) {
      throw new Error("File ID is required");
    }

    await imagekit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error("ImageKit delete error:", error);
    // Don't throw error - file might already be deleted
    return false;
  }
};

/**
 * Generate ImageKit URL with transformations
 * @param {String} fileId - ImageKit file ID or path
 * @param {Object} transformations - Image transformation options
 * @returns {String} - Transformed URL
 */
export const getTransformedUrl = (filePath, transformations = {}) => {
  const defaultTransformations = {
    width: 800,
    height: 800,
    crop: "fit",
    quality: 80,
  };

  const transformOptions = { ...defaultTransformations, ...transformations };

  return imagekit.url({
    path: filePath,
    transformation: [transformOptions],
  });
};
