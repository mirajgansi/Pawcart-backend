import { Request, Response } from "express";
import z from "zod";
import { ProductService } from "../services/product.service";
import {
  CreateProductDto,
  RestockProductDto,
  UpdateProductDto,
  RateProductDto,
  AddCommentDto,
} from "../dtos/product.dto";
import mongoose from "mongoose";

const productService = new ProductService();

interface QueryParams {
  page?: string;
  size?: string;
  search?: string;
  category?: string;
  productCategory?: string; // 👈 added
}

export class ProductController {
  // ---------------- CREATE (ADMIN ONLY) ----------------
  async createProduct(req: Request, res: Response) {
    try {
      const adminId = req.user?._id;
      if (!adminId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateProductDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Image is required" });
      }

      parsedData.data.image = `/uploads/${files[0].filename}`;
      parsedData.data.images = files.map((f) => `/uploads/${f.filename}`);

      const product = await productService.createProduct(
        parsedData.data,
        adminId,
      );

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- READ ----------------
  async getProductById(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      const userId = req.user?._id?.toString();

      const product = await productService.getProductById(productId, userId);

      return res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const { page, size, search, category, productCategory }: QueryParams =
        req.query; // 👈 added productCategory

      const products = await productService.getAllProducts({
        page,
        size,
        search,
        category,
        productCategory, // 👈 added
      });

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductsByCategory(req: Request, res: Response) {
    try {
      const products = await productService.getProductsByCategory(
        req.params.category,
      );

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductsByProductCategory(req: Request, res: Response) {
    try {
      const products = await productService.getProductsByProductCategory(
        req.params.productCategory,
      );

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ── Per pet-category ───────────────────────────────────────────────────────

  private paginationParams(req: Request) {
    return {
      page: Number(req.query.page ?? 1),
      size: Number(req.query.size ?? 10),
    };
  }

  private paginatedResponse(
    res: Response,
    message: string,
    result: { products: any[]; total: number },
    page: number,
    size: number,
  ) {
    return res.status(200).json({
      success: true,
      message,
      data: result.products,
      pagination: {
        page,
        size,
        total: result.total,
        totalPages: Math.ceil(result.total / size),
      },
    });
  }

  async getProductsByDogs(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByDogs(page, size);
      return this.paginatedResponse(
        res,
        "Dogs products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByCats(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByCats(page, size);
      return this.paginatedResponse(
        res,
        "Cats products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByBirds(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByBirds(page, size);
      return this.paginatedResponse(
        res,
        "Birds products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByFish(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByFish(page, size);
      return this.paginatedResponse(
        res,
        "Fish products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByRabbits(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByRabbits(page, size);
      return this.paginatedResponse(
        res,
        "Rabbits products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsBySmallPets(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsBySmallPets(page, size);
      return this.paginatedResponse(
        res,
        "Small pets products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  // ── Per product-category ───────────────────────────────────────────────────

  async getProductsByFood(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByFood(page, size);
      return this.paginatedResponse(
        res,
        "Food products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByAccessories(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByAccessories(page, size);
      return this.paginatedResponse(
        res,
        "Accessories fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByHousing(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByHousing(page, size);
      return this.paginatedResponse(
        res,
        "Housing products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByGrooming(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByGrooming(page, size);
      return this.paginatedResponse(
        res,
        "Grooming products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByToys(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByToys(page, size);
      return this.paginatedResponse(
        res,
        "Toys fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  async getProductsByHealthCare(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getProductsByHealthCare(page, size);
      return this.paginatedResponse(
        res,
        "Health care products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  // recently added
  async getRecentlyAdded(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getRecentlyAdded(page, size);
      return this.paginatedResponse(
        res,
        "Recently added products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  // trending
  async getTrending(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getTrending(page, size);
      return this.paginatedResponse(
        res,
        "Trending products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  // popular
  async getMostPopular(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getMostPopular(page, size);
      return this.paginatedResponse(
        res,
        "Popular products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  // top rated
  async getTopRated(req: Request, res: Response) {
    try {
      const { page, size } = this.paginationParams(req);
      const result = await productService.getTopRated(page, size);
      return this.paginatedResponse(
        res,
        "Top rated products fetched successfully",
        result,
        page,
        size,
      );
    } catch (error: any) {
      return res
        .status(error.statusCode ?? 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  // ---------------- UPDATE (ADMIN) ----------------
  async updateProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;

      const body: any = { ...req.body };

      if (typeof body.existingImages === "string") {
        try {
          body.existingImages = JSON.parse(body.existingImages);
        } catch {
          return res.status(400).json({
            success: false,
            message: "existingImages must be valid JSON",
          });
        }
      }

      const parsedData = UpdateProductDto.safeParse(body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const files = (req as any).files as Express.Multer.File[] | undefined;
      if (files?.length) {
        const newImages = files.map((f) => `/uploads/${f.filename}`);
        parsedData.data.existingImages = [
          ...(Array.isArray(parsedData.data.existingImages)
            ? parsedData.data.existingImages
            : []),
          ...newImages,
        ];
      }

      const updated = await productService.updateProduct(
        productId,
        parsedData.data,
      );

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- DELETE (ADMIN ONLY) ----------------
  async deleteProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      const result = await productService.deleteProduct(productId);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- RESTOCK (ADMIN) ----------------
  async restockProduct(req: Request, res: Response) {
    try {
      const adminId = req.user?._id;
      if (!adminId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const productId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product id" });
      }

      const parsed = RestockProductDto.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const updated = await productService.restockProduct(
        productId,
        parsed.data,
      );

      return res.status(200).json({
        success: true,
        message: "Product restocked successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- OUT OF STOCK ----------------
  async getOutOfStockProducts(req: Request, res: Response) {
    try {
      const { page, size, search, category }: QueryParams = req.query;

      const result = await productService.getOutOfStockProducts({
        page,
        size,
        search,
        category,
      });

      return res.status(200).json({
        success: true,
        message: "Out of stock products fetched successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- VIEW COUNT (PUBLIC) ----------------
  async incrementViewCount(req: Request, res: Response) {
    try {
      const productId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product id" });
      }

      const updated = await productService.incrementViewCount(productId);

      return res.status(200).json({
        success: true,
        message: "View count incremented",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ======================================================
  // RATING / FAVORITE / COMMENT (USER)
  // ======================================================

  async rateProduct(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const productId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product id" });
      }

      const parsed = RateProductDto.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const updated = await productService.rateProduct(
        productId,
        userId.toString(),
        parsed.data.rating,
      );

      return res.status(200).json({
        success: true,
        message: "Product rated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async toggleFavorite(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const productId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product id" });
      }

      const updated = await productService.toggleFavorite(
        productId,
        userId.toString(),
      );

      return res.status(200).json({
        success: true,
        message: "Favorite updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const productId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product id" });
      }

      const parsed = AddCommentDto.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const username = req.user?.username; // 👈 pulled from authenticated user
      if (!username) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const updated = await productService.addComment(
        productId,
        userId.toString(),
        username, // 👈 passed to service
        parsed.data.comment,
      );

      return res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- USER FAVORITES ----------------
  async getUserFavorites(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const products = await productService.getUserFavorites(userId.toString());

      return res.status(200).json({
        success: true,
        message: "Favorite products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- GET COMMENTS (PUBLIC) ----------------
  async getProductComments(req: Request, res: Response) {
    try {
      const productId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product id" });
      }

      const comments = await productService.getProductComments(productId);

      return res.status(200).json({
        success: true,
        message: "Comments fetched successfully",
        data: comments,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
