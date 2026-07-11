import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = Router();

//* Tenant
router.post("/create", auth(UserRole.TENANT), paymentController.createPayment);

//* webhook
router.post("/confirm", paymentController.confirmPayment);

//* Tenant
router.get(
  "/my-payments",
  auth(UserRole.TENANT),
  paymentController.getMyPayments,
);

router.get(
  "/landlord",
  auth(UserRole.LANDLORD),
  paymentController.getLandlordPayments,
);

router.get(
  "/:id",
  auth(),
  paymentController.getSinglePayment,
);

export const paymentRoutes = router;
