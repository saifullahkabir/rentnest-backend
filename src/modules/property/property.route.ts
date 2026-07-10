import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";

const router = Router();

//* Landlord
router.post(
  "/landlord",
  auth(UserRole.LANDLORD),
  propertyController.createProperty,
);

router.get(
  "/landlord",
  auth(UserRole.LANDLORD),
  propertyController.getMyProperties,
);

// router.patch(
//   "/landlord/:id",
//   auth(UserRole.LANDLORD),
//   propertyController.updateProperty,
// );

// router.delete(
//   "/landlord/:id",
//   auth(UserRole.LANDLORD),
//   propertyController.deleteProperty,
// );

export const propertyRoutes = router;
