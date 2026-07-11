import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";


const router = Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);

// router.get(
//   "/properties",
//   auth(UserRole.ADMIN),
//   adminController.getAllProperties,
// );

// router.get(
//   "/rental-requests",
//   auth(UserRole.ADMIN),
//   adminController.getAllRentalRequests,
// );

// router.patch(
//   "/users/:id",
//   auth(UserRole.ADMIN),
//   adminController.updateUserStatus,
// );

export const adminRoutes = router;
