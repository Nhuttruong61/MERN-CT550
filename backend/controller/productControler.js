const express = require("express");
const Product = require("../model/product");
const cloudinary = require("cloudinary");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

//create product
router.post(
  "/create-product",
  isAuthenticated,
  isAdmin("admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        name,
        description,
        category,
        tags,
        originPrice,
        distCount,
        quantity,
        images,
      } = req.body;
      if (
        !name ||
        !description ||
        !category ||
        !tags ||
        !originPrice ||
        !distCount ||
        !quantity ||
        !images
      ) {
        return next(
          new ErrorHandler("Please provide complete product informations", 400)
        );
      }
      const myCloud = await cloudinary.v2.uploader.upload(images, {
        folder: "imgProducts",
      });
      const product = await Product.create({
        name,
        description,
        category,
        tags,
        originPrice,
        distCount,
        quantity,
        images: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      });
      await product.save();
      res.status(201).json({
        success: true,
        product,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 400));
    }
  })
);

//get all products
router.get(
  "/get-all-products",
  isAuthenticated,
  isAdmin("admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.find();
      res.status(200).json({
        success: true,
        product: product,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 400));
    }
  })
);
// get product by id
router.get(
  "/get-products/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      res.status(200).json({
        success: true,
        product: product,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  })
);

// update product
router.put(
  "/update-product/:id",
  isAuthenticated,
  isAdmin("admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = await Product.findById(req.params.id);
      const product = await Product.findById(productId);
      const {
        name,
        description,
        category,
        tags,
        originPrice,
        distCount,
        quantity,
        newImage,
      } = req.body;
      if (!productId) {
        return next(new ErrorHandler("Product does not exists", 400));
      }
      if (newImage) {
        const myCloud = await cloudinary.v2.uploader.upload(newImage, {
          folder: "imgProducts",
        });
        product.images = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
        if (product.images.public_id) {
          await cloudinary.v2.uploader.destroy(product.images.public_id);
        }
      }
      product.name = name;
      product.description = description;
      product.category = category;
      product.tags = tags;
      product.originPrice = originPrice;
      product.distCount = distCount;
      product.quantity = quantity;
      await product.save();
      res.status(200).json({
        success: true,
        product,
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  })
);

//delete product
router.delete(
  "/delete-product/:id",
  isAuthenticated,
  isAdmin("admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product does not exist", 404));
      }
      if (product.images && product.images.public_id) {
        await cloudinary.v2.uploader.destroy(product.images.public_id);
      }
      await Product.findByIdAndDelete(req.params.id);
      res.status(201).json({
        success: true,
        message: "Product deleted successfully!",
      });
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  })
);

// review for a product

router.put(
  "/create-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {  } = req.body
    } catch (err) {
      return next(new ErrorHandler(err.message, 500));
    }
  })
);

module.exports = router;
