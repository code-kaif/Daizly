// test/imagekitTest.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { uploadToImageKit, deleteFromImageKit } from "../utils/imageUpload.js";
import fs from "fs";

dotenv.config();

const testImageKit = async () => {
  try {
    console.log("=== Testing ImageKit Integration ===");

    // Test 1: Check ImageKit Configuration
    console.log("\n1. Checking ImageKit configuration...");
    console.log("URL Endpoint:", process.env.IMAGEKIT_URL_ENDPOINT);
    console.log(
      "Public Key:",
      process.env.IMAGEKIT_PUBLIC_KEY ? "✓ Set" : "✗ Missing"
    );
    console.log(
      "Private Key:",
      process.env.IMAGEKIT_PRIVATE_KEY ? "✓ Set" : "✗ Missing"
    );

    // Test 2: Create a test image file
    console.log("\n2. Creating test image file...");
    const testFilePath = "./test-image.jpg";

    // Create a simple 1x1 pixel JPEG for testing
    const base64Image =
      "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCJgDGH/9k=";
    fs.writeFileSync(testFilePath, Buffer.from(base64Image, "base64"));

    const testFile = {
      path: testFilePath,
      originalname: "test-image.jpg",
    };

    // Test 3: Upload test image
    console.log("\n3. Uploading test image to ImageKit...");
    try {
      const uploadResult = await uploadToImageKit(testFile, "test-folder", {
        fileName: "test-upload.jpg",
      });

      console.log("✓ Upload successful!");
      console.log("URL:", uploadResult.url);
      console.log("File ID:", uploadResult.fileId);
      console.log("File Name:", uploadResult.fileName);

      // Test 4: Test delete functionality
      console.log("\n4. Testing delete functionality...");
      const deleteResult = await deleteFromImageKit(uploadResult.fileId);
      console.log(deleteResult ? "✓ Delete successful!" : "✗ Delete failed");
    } catch (uploadError) {
      console.log("✗ Upload failed:", uploadError.message);
    }

    // Clean up
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    console.log("\n=== Testing completed ===");
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    process.exit(0);
  }
};

testImageKit();
