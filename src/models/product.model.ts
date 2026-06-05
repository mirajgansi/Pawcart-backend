import mongoose, { HydratedDocument, Schema } from "mongoose";
import { ProductType } from "../types/product.type";

export type ProductDoc = HydratedDocument<ProductType>;

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const RatingSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false },
);

const CommentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// ─── Category-specific attribute sub-schemas ──────────────────────────────────

/** food */
const FoodAttributesSchema = new Schema(
  {
    nutritionalInfo: { type: String, required: true },
    manufactureDate: { type: String, default: null },
    expireDate: { type: String, default: null },
  },
  { _id: false },
);

/** accessories */
const AccessoryAttributesSchema = new Schema(
  {
    pattern: { type: String, required: true },
    colors: { type: [String], required: true },
    material: { type: String, required: true },
    size: { type: String, required: true },
    manufactureDate: { type: String, default: null },
    expireDate: { type: String, default: null },
  },
  { _id: false },
);

/** toys */
const ToyAttributesSchema = new Schema(
  {
    pattern: { type: String, required: true },
    colors: { type: [String], required: true },
    material: { type: String, required: true },
    size: { type: String, required: true },
    manufactureDate: { type: String, default: null },
    expireDate: { type: String, default: null },
  },
  { _id: false },
);

/** grooming */
const GroomingAttributesSchema = new Schema(
  {
    skinType: { type: String, required: true },
    coatType: { type: String, required: true },
    scent: { type: String, default: null },
    volume: { type: String, default: null },
    isHypoallergenic: { type: Boolean, default: false },
    manufactureDate: { type: String, default: null },
    expireDate: { type: String, default: null },
  },
  { _id: false },
);

/** housing & health-care — only shared optional fields */
const GenericAttributesSchema = new Schema(
  {
    manufactureDate: { type: String, default: null },
    expireDate: { type: String, default: null },
  },
  { _id: false },
);

// ─── Main Product schema ──────────────────────────────────────────────────────

const ProductSchema = new Schema<ProductType>(
  {
    // ── Base fields ────────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0, index: true },
    inStock: { type: Number, default: 0, min: 0 },
    manufacturer: { type: String, required: true },

    category: { type: String, required: true, index: true },
    productCategory: { type: String, required: true, index: true },

    image: { type: String },
    images: [{ type: String }],

    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    ratings: { type: [RatingSchema], default: [] },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: { type: [CommentSchema], default: [] },

    // ── Category-specific attributes (one will be populated based on productCategory) ──
    foodAttributes: { type: FoodAttributesSchema, default: null },
    accessoryAttributes: { type: AccessoryAttributesSchema, default: null },
    toyAttributes: { type: ToyAttributesSchema, default: null },
    groomingAttributes: { type: GroomingAttributesSchema, default: null },
    genericAttributes: { type: GenericAttributesSchema, default: null },
  } as any,
  { timestamps: true },
);

// ─── Pre-save guard: ensure only the right attributes block is set ─────────────
ProductSchema.pre("save", async function () {
  const categoryMap: Record<string, string> = {
    food: "foodAttributes",
    accessories: "accessoryAttributes",
    toys: "toyAttributes",
    grooming: "groomingAttributes",
    housing: "genericAttributes",
    "health-care": "genericAttributes",
  };

  const allAttrFields = [
    "foodAttributes",
    "accessoryAttributes",
    "toyAttributes",
    "groomingAttributes",
    "genericAttributes",
  ] as const;

  const activeField = categoryMap[this.productCategory as string];

  for (const field of allAttrFields) {
    if (field !== activeField) {
      (this as any)[field] = null;
    }
  }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

ProductSchema.index({ productCategory: 1, category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ totalSold: -1 });

// ─── Model ────────────────────────────────────────────────────────────────────

export const ProductModel =
  mongoose.models.Product ||
  mongoose.model<ProductType>("Product", ProductSchema);
