import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", categoryController.getAllCategories)

router.post("/", auth(UserRole.ADMIN), categoryController.createCategory);

router.patch("/:id", auth(UserRole.ADMIN), categoryController.updateCategory)

export const categoryRoutes = router;
