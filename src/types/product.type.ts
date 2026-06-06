import z from "zod";

export const PET_CATEGORIES = [
  "dogs",
  "cats",
  "birds",
  "fish",
  "rabbits",
  "small-pets",
] as const;

export const PRODUCT_CATEGORIES = [
  "food",
  "accessories",
  "housing",
  "grooming",
  "toys",
  "health-care",
] as const;

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const RatingSchema = z.object({
  userId: z.string(),
  rating: z.number().min(1).max(5),
});

const CommentSchema = z.object({
  userId: z.string(),
  username: z.string(),
  comment: z.string().min(1, "Comment cannot be empty"),
  createdAt: z.string().datetime().optional(),
});

// ─── Category-specific attribute schemas ─────────────────────────────────────

/** Only required for "food" */
export const FoodAttributesSchema = z.object({
  productCategory: z.literal("food"),
  nutritionalInfo: z
    .string()
    .min(1, "Nutritional info is required for food products"),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

export const ACCESSORY_PATTERNS = [
  "solid",
  "striped",
  "plaid",
  "floral",
  "polka-dot",
  "geometric",
  "camouflage",
  "tie-dye",
] as const;

export const ACCESSORY_COLORS = [
  "red",
  "blue",
  "orange",
  "black",
  "pink",
  "green",
  "yellow",
  "purple",
  "white",
  "brown",
] as const;

export const ACCESSORY_MATERIALS = [
  "nylon",
  "leather",
  "cotton",
  "polyester",
  "rubber",
  "metal",
] as const;

export const ACCESSORY_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/** Required for "accessories" */
export const AccessoryAttributesSchema = z.object({
  productCategory: z.literal("accessories"),
  pattern: z.enum(ACCESSORY_PATTERNS, {
    message: "Pattern is required for accessories",
  }),
  colors: z
    .array(z.enum(ACCESSORY_COLORS))
    .min(1, "At least one color is required"),
  material: z.enum(ACCESSORY_MATERIALS, {
    message: "Material is required for accessories",
  }),
  size: z.enum(ACCESSORY_SIZES, {
    message: "Size is required for accessories",
  }),
  nutritionalInfo: z.string().optional().nullable(),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

export const TOY_PATTERNS = [
  "solid",
  "striped",
  "spotted",
  "printed",
  "multi-color",
] as const;

export const TOY_COLORS = ACCESSORY_COLORS; // reuse same palette
export const TOY_MATERIALS = [
  "nylon",
  "rubber",
  "plush",
  "rope",
  "latex",
  "plastic",
] as const;
export const TOY_SIZES = ACCESSORY_SIZES;

/** Required for "toys" */
export const ToyAttributesSchema = z.object({
  productCategory: z.literal("toys"),
  pattern: z.enum(TOY_PATTERNS, { message: "Pattern is required for toys" }),
  colors: z.array(z.enum(TOY_COLORS)).min(1, "At least one color is required"),
  material: z.enum(TOY_MATERIALS, { message: "Material is required for toys" }),
  size: z.enum(TOY_SIZES, { message: "Size is required for toys" }),
  nutritionalInfo: z.string().optional().nullable(),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

export const GROOMING_SKIN_TYPES = [
  "all",
  "sensitive",
  "dry",
  "oily",
  "normal",
] as const;
export const GROOMING_COAT_TYPES = [
  "short",
  "long",
  "curly",
  "double-coat",
  "wire-haired",
  "all",
] as const;
export const GROOMING_SCENTS = [
  "unscented",
  "lavender",
  "citrus",
  "mint",
  "oatmeal",
  "coconut",
] as const;
export const GROOMING_VOLUMES = [
  "50ml",
  "100ml",
  "200ml",
  "250ml",
  "500ml",
  "1L",
] as const;

/** Required for "grooming" */
const GroomingAttributesSchema = z.object({
  productCategory: z.literal("grooming"),
  skinType: z.enum(GROOMING_SKIN_TYPES, {
    message: "Skin type is required for grooming products",
  }),
  coatType: z.enum(GROOMING_COAT_TYPES, {
    message: "Coat type is required for grooming products",
  }),
  scent: z.enum(GROOMING_SCENTS).optional(),
  volume: z.enum(GROOMING_VOLUMES).optional(),
  isHypoallergenic: z.boolean().default(false),
  nutritionalInfo: z.string().optional().nullable(),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

/** "housing" and "health-care" — no special required fields */
const GenericAttributesSchema = z.object({
  productCategory: z.enum(["housing", "health-care"] as const),
  nutritionalInfo: z.string().optional().nullable(),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

// ─── Discriminated union of category attributes ───────────────────────────────

const CategoryAttributesSchema = z.discriminatedUnion("productCategory", [
  FoodAttributesSchema,
  AccessoryAttributesSchema,
  ToyAttributesSchema,
  GroomingAttributesSchema,
  GenericAttributesSchema,
]);

export type CategoryAttributes = z.infer<typeof CategoryAttributesSchema>;

// ─── Base product fields (shared across ALL categories) ───────────────────────

export const BaseProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  inStock: z.coerce.number().int("Stock must be an integer").min(0).default(0),
  manufacturer: z.string().min(1, "Manufacturer is required"),

  category: z.enum(PET_CATEGORIES, { message: "Pet category is required" }),

  image: z.string().min(1, "Image is required").optional(),
  images: z.array(z.string()).optional(),

  ratings: z.array(RatingSchema).default([]),
  averageRating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),

  favorites: z.array(z.string()).default([]),
  comments: z.array(CommentSchema).default([]),

  totalSold: z.number().int().min(0).default(0),
  totalRevenue: z.number().min(0).default(0),
  viewCount: z.number().int().min(0).default(0),
});

// ─── Final merged schema ──────────────────────────────────────────────────────

export const ProductSchema = z.intersection(
  BaseProductSchema,
  CategoryAttributesSchema,
);

export type ProductType = z.infer<typeof ProductSchema>;

// ─── Convenience: narrow types per category ───────────────────────────────────

type BaseProduct = z.infer<typeof BaseProductSchema>;

export type FoodProduct = BaseProduct & z.infer<typeof FoodAttributesSchema>;
export type AccessoryProduct = BaseProduct &
  z.infer<typeof AccessoryAttributesSchema>;
export type ToyProduct = BaseProduct & z.infer<typeof ToyAttributesSchema>;
export type GroomingProduct = BaseProduct &
  z.infer<typeof GroomingAttributesSchema>;
export type HousingProduct = BaseProduct & { productCategory: "housing" };
export type HealthCareProduct = BaseProduct & {
  productCategory: "health-care";
};
