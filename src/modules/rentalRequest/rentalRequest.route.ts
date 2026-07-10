import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { rentalRequestController } from "./rentalRequest.controller";

const router = Router();

//* tenant
router.post(
  "/",
  auth(UserRole.TENANT),
  rentalRequestController.createRentalRequest,
);

router.get(
  "/my-requests",
  auth(UserRole.TENANT),
  rentalRequestController.getMyRequests,
);

//* landlord
router.get(
  "/landlord",
  auth(UserRole.LANDLORD),
  rentalRequestController.getLandlordRequests,
);

router.patch(
  "/landlord/:id",
  auth(UserRole.LANDLORD),
  rentalRequestController.updateRentalRequestStatus,
);

//* Shared (Tenant or Landlord)
router.get("/:id", auth(), rentalRequestController.getSingleRentalRequest);

export const rentalRequestRoutes = router;
