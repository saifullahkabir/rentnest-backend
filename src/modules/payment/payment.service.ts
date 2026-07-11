import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreatePayment } from "./payment.interface";
import {
  PaymentProvider,
  PaymentStatus,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { stripe } from "../../lib/stripe";

const createPayment = async (tenantId: string, payload: ICreatePayment) => {
  const request = await prisma.rentalRequest.findUnique({
    where: {
      id: payload.rentalRequestId,
    },
    include: {
      property: true,
    },
  });

  if (!request) {
    throw new AppError(HttpStatus.NOT_FOUND, "Rental request not found.");
  }

  if (request.tenantId !== tenantId) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      "You are not allowed to pay for this rental request.",
    );
  }

  if (request.status !== RentalRequestStatus.APPROVED) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "Rental request is not approved yet.",
    );
  }

  const paymentExists = await prisma.payment.findUnique({
    where: {
      rentalRequestId: request.id,
    },
  });

  if (paymentExists) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "Payment already exists for this rental request.",
    );
  }

  // Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        price_data: {
          currency: "bdt",

          product_data: {
            name: request.property.title,
            description: request.property.description,
          },

          unit_amount: Math.round(request.property.rentAmount * 100),
        },

        quantity: 1,
      },
    ],

    success_url: `${config.app_url}/payment/success`,
    cancel_url: `${config.app_url}/payment/cancel`,

    metadata: {
      tenantId,
      rentalRequestId: request.id,
    },
  });

  await prisma.payment.create({
    data: {
      rentalRequestId: request.id,
      tenantId,

      stripeSessionId: session.id,

      amount: request.property.rentAmount,

      provider: PaymentProvider.STRIPE,

      status: PaymentStatus.PENDING,
    },
  });

  return {
    paymentUrl: session.url,
  };
};

export const paymentService = {
  createPayment,
};
