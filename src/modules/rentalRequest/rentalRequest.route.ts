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



// router.get(
//   "/landlord",
//   auth(UserRole.LANDLORD),
//   rentalRequestController.getLandlordRequests,
// );

// router.get("/:id", auth(), rentalRequestController.getSingleRentalRequest);

// router.patch(
//   "/:id",
//   auth(UserRole.LANDLORD),
//   rentalRequestController.updateRentalRequestStatus,
// );

export const rentalRequestRoutes = router;
