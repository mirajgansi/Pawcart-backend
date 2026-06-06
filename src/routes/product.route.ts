import { Router } from "express";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";
import { ProductController } from "../controllers/product.controller";

const router = Router();
const productController = new ProductController();

// ─── Admin (CRUD) ─────────────────────────────────────────────────────────────

router.post(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  uploads.array("image", 3),
  productController.createProduct.bind(productController),
);

router.put(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  uploads.array("image", 3),
  productController.updateProduct.bind(productController),
);

router.put(
  "/:id/restock",
  authorizedMiddleware,
  adminMiddleware,
  productController.restockProduct.bind(productController),
);

router.delete(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  productController.deleteProduct.bind(productController),
);

// ─── User interactions ────────────────────────────────────────────────────────

router.post(
  "/:id/rate",
  authorizedMiddleware,
  productController.rateProduct.bind(productController),
);

router.post(
  "/:id/favorite",
  authorizedMiddleware,
  productController.toggleFavorite.bind(productController),
);

router.post(
  "/:id/comment",
  authorizedMiddleware,
  productController.addComment.bind(productController),
);

router.get(
  "/favorites/me",
  authorizedMiddleware,
  productController.getUserFavorites.bind(productController),
);

// ─── Curated lists ────────────────────────────────────────────────────────────

router.get(
  "/recent",
  productController.getRecentlyAdded.bind(productController),
);
router.get("/trending", productController.getTrending.bind(productController));
router.get(
  "/popular",
  productController.getMostPopular.bind(productController),
);
router.get("/top-rated", productController.getTopRated.bind(productController));

// ─── Admin views ──────────────────────────────────────────────────────────────

router.get(
  "/out-of-stock",
  productController.getOutOfStockProducts.bind(productController),
);

// ─── Pet category routes  (GET /products/pet/:category) ──────────────────────
//     dogs | cats | birds | fish | rabbits | small-pets

router.get(
  "/pet/dogs",
  productController.getProductsByDogs.bind(productController),
);
router.get(
  "/pet/cats",
  productController.getProductsByCats.bind(productController),
);
router.get(
  "/pet/birds",
  productController.getProductsByBirds.bind(productController),
);
router.get(
  "/pet/fish",
  productController.getProductsByFish.bind(productController),
);
router.get(
  "/pet/rabbits",
  productController.getProductsByRabbits.bind(productController),
);
router.get(
  "/pet/small-pets",
  productController.getProductsBySmallPets.bind(productController),
);

// Dynamic fallback — covers all pet categories in one route if needed
router.get(
  "/pet/:category",
  productController.getProductsByCategory.bind(productController),
);

// ─── Product category routes  (GET /products/type/:productCategory) ───────────
//     food | accessories | housing | grooming | toys | health-care

router.get(
  "/type/food",
  productController.getProductsByFood.bind(productController),
);
router.get(
  "/type/accessories",
  productController.getProductsByAccessories.bind(productController),
);
router.get(
  "/type/housing",
  productController.getProductsByHousing.bind(productController),
);
router.get(
  "/type/grooming",
  productController.getProductsByGrooming.bind(productController),
);
router.get(
  "/type/toys",
  productController.getProductsByToys.bind(productController),
);
router.get(
  "/type/health-care",
  productController.getProductsByHealthCare.bind(productController),
);

// Dynamic fallback — covers all product categories in one route if needed
router.get(
  "/type/:productCategory",
  productController.getProductsByProductCategory.bind(productController),
);

// ─── General ──────────────────────────────────────────────────────────────────

// GET /products?page=1&size=10&search=&category=dogs&productCategory=food
router.get("/", productController.getAllProducts.bind(productController));

router.patch(
  "/:id/view",
  productController.incrementViewCount.bind(productController),
);

router.get(
  "/:id/comments",
  productController.getProductComments.bind(productController),
);

// ⚠️  Keep /:id LAST — it's a wildcard and would swallow all routes above it
router.get("/:id", productController.getProductById.bind(productController));

export default router;
