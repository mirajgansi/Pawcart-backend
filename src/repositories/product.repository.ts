import { ProductModel, ProductDoc } from "../models/product.model";
import type { ProductType } from "../types/product.type";
import { PET_CATEGORIES, PRODUCT_CATEGORIES } from "../types/product.type";

type ProductQueryArgs = {
  page: number;
  size: number;
  search?: string;
  category?: string;
  productCategory?: string; // 👈 added
};

export interface IProductRepository {
  getProductById(id: string): Promise<ProductDoc | null>;
  getAllProducts(
    args: ProductQueryArgs,
  ): Promise<{ products: ProductDoc[]; total: number }>;

  createProduct(productData: Partial<ProductType>): Promise<ProductDoc>;
  updateProduct(
    id: string,
    updateData: Partial<ProductType>,
  ): Promise<ProductDoc | null>;
  deleteProduct(id: string): Promise<boolean>;

  getRecentlyAdded(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getTrending(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getMostPopular(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getTopRated(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;

  // ── Per pet-category getters ─────────────────────────────────────────────
  getProductsByDogs(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByCats(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByBirds(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByFish(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByRabbits(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsBySmallPets(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;

  // ── Per product-category getters ─────────────────────────────────────────
  getProductsByFood(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByAccessories(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByHousing(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByGrooming(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByToys(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;
  getProductsByHealthCare(args: {
    page: number;
    size: number;
  }): Promise<{ products: ProductDoc[]; total: number }>;

  rateProduct(args: {
    productId: string;
    userId: string;
    rating: number;
  }): Promise<ProductDoc | null>;
  toggleFavorite(args: {
    productId: string;
    userId: string;
  }): Promise<ProductDoc | null>;
  addComment(args: {
    productId: string;
    userId: string;
    username: string; // 👈 added
    comment: string;
  }): Promise<ProductDoc | null>;
}

export class ProductRepository implements IProductRepository {
  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Maps productCategory → the attribute field name that should be populated.
   * Everything else gets nulled out by the pre-save hook, but we set the right
   * one explicitly here so it's clear at the application layer too.
   */
  private resolveAttributeField(productCategory: string): string | null {
    const map: Record<string, string> = {
      food: "foodAttributes",
      accessories: "accessoryAttributes",
      toys: "toyAttributes",
      grooming: "groomingAttributes",
      housing: "genericAttributes",
      "health-care": "genericAttributes",
    };
    return map[productCategory] ?? null;
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async createProduct(productData: Partial<ProductType>): Promise<ProductDoc> {
    const { productCategory } = productData as any;

    const safeData = {
      ...productData,
      ratings: [],
      favorites: [],
      comments: [],
      averageRating: 0,
      reviewCount: 0,
      // Ensure all attribute blocks start as null;
      // the pre-save hook will null out the irrelevant ones,
      // but being explicit here avoids any ambiguity.
      foodAttributes: null,
      accessoryAttributes: null,
      toyAttributes: null,
      groomingAttributes: null,
      genericAttributes: null,
    } as any;

    // Lift the category-specific attributes into the right field
    const attrField = this.resolveAttributeField(productCategory);
    if (attrField && (productData as any)[attrField]) {
      safeData[attrField] = (productData as any)[attrField];
    }

    return await ProductModel.create(safeData);
  }

  async getProductById(id: string): Promise<ProductDoc | null> {
    return await ProductModel.findById(id)
      .populate("comments.userId", "username")
      .populate("ratings.userId", "username");
  }

  async getProductByName(name: string): Promise<ProductDoc | null> {
    return await ProductModel.findOne({ name });
  }

  async updateProduct(
    id: string,
    updateData: Partial<ProductType>,
  ): Promise<ProductDoc | null> {
    // Strip fields that should never be updated directly
    const {
      ratings,
      favorites,
      comments,
      averageRating,
      reviewCount,
      ...safeUpdate
    } = updateData as any;

    return await ProductModel.findByIdAndUpdate(id, safeUpdate, {
      new: true,
      runValidators: true,
    }).populate("comments.userId", "username");
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  async getAllProducts({
    page,
    size,
    search,
    category,
    productCategory, // 👈 new
  }: ProductQueryArgs) {
    const skip = (page - 1) * size;
    const filter: any = {};

    if (search?.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    // pet category  e.g. "dogs", "cats"
    if (category?.trim()) {
      filter.category = category.trim();
    }

    // product category  e.g. "food", "toys"
    if (productCategory?.trim()) {
      filter.productCategory = productCategory.trim();
    }

    const [products, total] = await Promise.all([
      ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(size),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  async getProductsByCategory(category: string): Promise<ProductDoc[]> {
    return ProductModel.find({
      category: { $regex: `^${category.trim()}$`, $options: "i" },
    }).sort({ createdAt: -1 });
  }

  async getProductsByProductCategory(
    productCategory: string,
  ): Promise<ProductDoc[]> {
    return ProductModel.find({
      productCategory: { $regex: `^${productCategory.trim()}$`, $options: "i" },
    }).sort({ createdAt: -1 });
  }

  // ─── Curated lists ────────────────────────────────────────────────────────

  private async paginatedQuery(
    sort: Record<string, 1 | -1>,
    { page, size }: { page: number; size: number },
  ) {
    const skip = (page - 1) * size;
    const filter = { inStock: { $gt: 0 } };

    const [products, total] = await Promise.all([
      ProductModel.find(filter).sort(sort).skip(skip).limit(size),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  async getRecentlyAdded(args: { page: number; size: number }) {
    return this.paginatedQuery({ createdAt: -1 }, args);
  }

  async getTrending(args: { page: number; size: number }) {
    return this.paginatedQuery({ totalSold: -1 }, args);
  }

  async getMostPopular(args: { page: number; size: number }) {
    return this.paginatedQuery({ viewCount: -1 }, args);
  }

  async getTopRated(args: { page: number; size: number }) {
    return this.paginatedQuery({ averageRating: -1, reviewCount: -1 }, args);
  }

  // ─── Per pet-category getters ─────────────────────────────────────────────
  //
  // Each method is a thin wrapper around paginatedCategoryQuery so adding a
  // new pet category only requires one line here.

  private async paginatedCategoryQuery(
    filter: Record<string, any>,
    { page, size }: { page: number; size: number },
  ) {
    const skip = (page - 1) * size;
    const query = { inStock: { $gt: 0 }, ...filter };

    const [products, total] = await Promise.all([
      ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(size),
      ProductModel.countDocuments(query),
    ]);

    return { products, total };
  }

  async getProductsByDogs(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ category: "dogs" }, args);
  }
  async getProductsByCats(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ category: "cats" }, args);
  }
  async getProductsByBirds(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ category: "birds" }, args);
  }
  async getProductsByFish(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ category: "fish" }, args);
  }
  async getProductsByRabbits(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ category: "rabbits" }, args);
  }
  async getProductsBySmallPets(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ category: "small-pets" }, args);
  }

  // ─── Per product-category getters ─────────────────────────────────────────

  async getProductsByFood(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ productCategory: "food" }, args);
  }
  async getProductsByAccessories(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery(
      { productCategory: "accessories" },
      args,
    );
  }
  async getProductsByHousing(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ productCategory: "housing" }, args);
  }
  async getProductsByGrooming(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ productCategory: "grooming" }, args);
  }
  async getProductsByToys(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery({ productCategory: "toys" }, args);
  }
  async getProductsByHealthCare(args: { page: number; size: number }) {
    return this.paginatedCategoryQuery(
      { productCategory: "health-care" },
      args,
    );
  }

  // ─── Interactions ─────────────────────────────────────────────────────────

  async rateProduct({
    productId,
    userId,
    rating,
  }: {
    productId: string;
    userId: string;
    rating: number;
  }): Promise<ProductDoc | null> {
    const product = await ProductModel.findById(productId);
    if (!product) return null;

    product.ratings = product.ratings || [];

    const existing = product.ratings.find(
      (r: any) => String(r.userId) === String(userId),
    );

    if (existing) {
      existing.rating = rating;
    } else {
      product.ratings.push({ userId, rating } as any);
    }

    const total = product.ratings.reduce(
      (sum: number, r: any) => sum + Number(r.rating || 0),
      0,
    );
    product.reviewCount = product.ratings.length;
    product.averageRating =
      product.reviewCount === 0
        ? 0
        : Number((total / product.reviewCount).toFixed(2));

    await product.save();
    return product;
  }

  async toggleFavorite({
    productId,
    userId,
  }: {
    productId: string;
    userId: string;
  }): Promise<ProductDoc | null> {
    const product = await ProductModel.findById(productId);
    if (!product) return null;

    product.favorites = product.favorites || [];

    const idx = product.favorites.findIndex(
      (id: any) => String(id) === String(userId),
    );

    if (idx >= 0) product.favorites.splice(idx, 1);
    else product.favorites.push(userId as any);

    await product.save();
    return product;
  }

  async addComment({
    productId,
    userId,
    username, // 👈 now required
    comment,
  }: {
    productId: string;
    userId: string;
    username: string;
    comment: string;
  }): Promise<ProductDoc | null> {
    const product = await ProductModel.findById(productId);
    if (!product) return null;

    product.comments = product.comments || [];
    product.comments.push({ userId, username, comment } as any);

    await product.save();

    return await ProductModel.findById(productId)
      .populate("comments.userId", "username")
      .populate("ratings.userId", "username");
  }

  async getUserFavorites(userId: string): Promise<ProductDoc[]> {
    return ProductModel.find({ favorites: userId }).sort({ createdAt: -1 });
  }

  async getProductComments(productId: string) {
    const product = await ProductModel.findById(productId)
      .select("comments")
      .populate("comments.userId", "username");
    return product?.comments;
  }
}
