import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

//* public
router.get("/", categoryController.getAllCategories);

//* admin
router.post("/", auth(UserRole.ADMIN), categoryController.createCategory);
router.patch("/:id", auth(UserRole.ADMIN), categoryController.updateCategory);
router.delete("/:id", auth(UserRole.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;
