// migrationScript.js (run once)
import mongoose from "mongoose";
import productModel from "./models/productModel.js";
import dotenv from "dotenv";

dotenv.config();

const migrateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const products = await productModel.find({});

    for (const product of products) {
      if (Array.isArray(product.image) && product.image.length > 0) {
        // Convert old string URLs to new image objects
        const newImages = product.image.map((url) => ({
          url: url,
          fileId: null, // Can't get fileId for old Cloudinary images
          fileName: `migrated-${product._id}`,
          uploadedAt: new Date(),
        }));

        product.images = newImages;
        await product.save();
        console.log(`Migrated product: ${product.name}`);
      }
    }

    console.log("Migration completed!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrateImages();
