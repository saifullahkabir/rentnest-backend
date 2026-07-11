import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = Router();

//* Tenant
router.post("/create", auth(UserRole.TENANT), paymentController.createPayment);

router.post("/confirm", paymentController.confirmPayment);

export const paymentRoutes = router;
