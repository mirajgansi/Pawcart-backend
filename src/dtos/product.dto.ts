import { z } from "zod";
import {
  BaseProductSchema,
  ACCESSORY_COLORS,
  ACCESSORY_MATERIALS,
  ACCESSORY_PATTERNS,
  ACCESSORY_SIZES,
  GROOMING_COAT_TYPES,
  GROOMING_SCENTS,
  GROOMING_SKIN_TYPES,
  GROOMING_VOLUMES,
  TOY_MATERIALS,
  TOY_PATTERNS,
  TOY_COLORS,
  TOY_SIZES,
} from "../types/product.type";

// ─── Category-specific attribute DTOs ─────────────────────────────────────────

export const FoodAttributesDto = z.object({
  nutritionalInfo: z.string().min(1, "Nutritional info is required for food"),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

export const AccessoryAttributesDto = z.object({
  pattern: z.enum(ACCESSORY_PATTERNS, { message: "Pattern is required" }),
  colors: z
    .array(z.enum(ACCESSORY_COLORS))
    .min(1, "At least one color is required"),
  material: z.enum(ACCESSORY_MATERIALS, { message: "Material is required" }),
  size: z.enum(ACCESSORY_SIZES, { message: "Size is required" }),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

export const ToyAttributesDto = z.object({
  pattern: z.enum(TOY_PATTERNS, { message: "Pattern is required" }),
  colors: z.array(z.enum(TOY_COLORS)).min(1, "At least one color is required"),
  material: z.enum(TOY_MATERIALS, { message: "Material is required" }),
  size: z.enum(TOY_SIZES, { message: "Size is required" }),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

export const GroomingAttributesDto = z.object({
  skinType: z.enum(GROOMING_SKIN_TYPES, { message: "Skin type is required" }),
  coatType: z.enum(GROOMING_COAT_TYPES, { message: "Coat type is required" }),
  scent: z.enum(GROOMING_SCENTS).optional().nullable(),
  volume: z.enum(GROOMING_VOLUMES).optional().nullable(),
  isHypoallergenic: z.boolean().default(false),
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

export const GenericAttributesDto = z.object({
  manufactureDate: z.string().optional().nullable(),
  expireDate: z.string().optional().nullable(),
});

// ─── Base shared fields ───────────────────────────────────────────────────────
// Use BaseProductSchema (ZodObject) not ProductSchema (ZodIntersection)
// because ZodIntersection does not support .pick()

const BaseProductFields = BaseProductSchema.pick({
  name: true,
  description: true,
  price: true,
  manufacturer: true,
  category: true,
  inStock: true,
}).extend({
  price: z.coerce.number().positive(),
  inStock: z.coerce.number().int().min(0).default(0),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  existingImages: z.union([z.string(), z.array(z.string())]).optional(),
  sku: z.string().optional(),
  productCategory: z.enum(
    ["food", "accessories", "housing", "grooming", "toys", "health-care"],
    { message: "Product category is required" },
  ),
});

// ─── CreateProductDto ─────────────────────────────────────────────────────────

export const CreateProductDto = BaseProductFields.extend({
  foodAttributes: FoodAttributesDto.optional(),
  accessoryAttributes: AccessoryAttributesDto.optional(),
  toyAttributes: ToyAttributesDto.optional(),
  groomingAttributes: GroomingAttributesDto.optional(),
  genericAttributes: GenericAttributesDto.optional(),
}).superRefine((data: any, ctx: z.RefinementCtx) => {
  switch (data.productCategory) {
    case "food": {
      const parsed = FoodAttributesDto.safeParse(data.foodAttributes ?? {});
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) =>
          ctx.addIssue({ ...issue, path: ["foodAttributes", ...issue.path] }),
        );
      }
      break;
    }
    case "accessories": {
      const parsed = AccessoryAttributesDto.safeParse(
        data.accessoryAttributes ?? {},
      );
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) =>
          ctx.addIssue({
            ...issue,
            path: ["accessoryAttributes", ...issue.path],
          }),
        );
      }
      break;
    }
    case "toys": {
      const parsed = ToyAttributesDto.safeParse(data.toyAttributes ?? {});
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) =>
          ctx.addIssue({ ...issue, path: ["toyAttributes", ...issue.path] }),
        );
      }
      break;
    }
    case "grooming": {
      const parsed = GroomingAttributesDto.safeParse(
        data.groomingAttributes ?? {},
      );
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) =>
          ctx.addIssue({
            ...issue,
            path: ["groomingAttributes", ...issue.path],
          }),
        );
      }
      break;
    }
    case "housing":
    case "health-care":
      break;
  }
});

export type CreateProductDto = z.infer<typeof CreateProductDto>;

// ─── UpdateProductDto ─────────────────────────────────────────────────────────

export const UpdateProductDto = BaseProductFields.partial().extend({
  existingImages: z.array(z.string()).optional(),

  price: z.coerce.number().positive().optional(),
  inStock: z.coerce.number().int().min(0).optional(),

  manufacturer: z.string().optional().or(z.literal("")),
  sku: z.string().optional().or(z.literal("")),

  foodAttributes: FoodAttributesDto.partial().optional(),
  accessoryAttributes: AccessoryAttributesDto.partial().optional(),
  toyAttributes: ToyAttributesDto.partial().optional(),
  groomingAttributes: GroomingAttributesDto.partial().optional(),
  genericAttributes: GenericAttributesDto.partial().optional(),
});

export type UpdateProductDto = z.infer<typeof UpdateProductDto>;

// ─── Other DTOs ───────────────────────────────────────────────────────────────

export const RestockProductDto = z.object({
  quantity: z.coerce.number().int().min(0),
  mode: z.enum(["set", "add"]).optional().default("set"),
});
export type RestockProductDto = z.infer<typeof RestockProductDto>;

export const OutOfStockQueryDto = z.object({
  page: z.coerce.number().int().min(1).optional(),
  size: z.union([z.literal("all"), z.coerce.number().int().min(1)]).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  productCategory: z.string().optional(),
});
export type OutOfStockQueryDto = z.infer<typeof OutOfStockQueryDto>;

export const RateProductDto = z.object({
  rating: z.coerce.number().min(1).max(5),
});
export type RateProductDto = z.infer<typeof RateProductDto>;

export const ToggleFavoriteDto = z.object({
  productId: z.string().optional(),
});
export type ToggleFavoriteDto = z.infer<typeof ToggleFavoriteDto>;

export const AddCommentDto = z.object({
  comment: z.string().min(1, "Comment cannot be empty"),
});
export type AddCommentDto = z.infer<typeof AddCommentDto>;
