import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import {
  PaymentStatus,
  PropertyAvailability,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalRequestId = session.metadata?.rentalRequestId;

  if (!rentalRequestId) {
    console.log("Rental request id not found.");
    return;
  }

  const transactionId = session.payment_intent as string;

  await prisma.$transaction(async (tx) => {
    //* Get property id from rental request
    const rentalRequest = await tx.rentalRequest.findUniqueOrThrow({
      where: {
        id: rentalRequestId,
      },
      select: {
        propertyId: true,
      },
    });

    //* Update payment
    await tx.payment.update({
      where: {
        rentalRequestId,
      },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId,
        paidAt: new Date(),
      },
    });

    //* Update rental request
    await tx.rentalRequest.update({
      where: {
        id: rentalRequestId,
      },
      data: {
        status: RentalRequestStatus.ACTIVE,
      },
    });

    //* Make property unavailable
    await tx.property.update({
      where: {
        id: rentalRequest.propertyId,
      },
      data: {
        availability: PropertyAvailability.UNAVAILABLE,
      },
    });
  });
};
