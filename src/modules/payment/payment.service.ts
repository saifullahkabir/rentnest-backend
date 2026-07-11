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
import { handleCheckoutCompleted } from "./payment.utils";
import Stripe from "stripe";

const createPayment = async (tenantId: string, payload: ICreatePayment) => {
  const request = await prisma.rentalRequest.findUnique({
    where: {
      id: payload.rentalRequestId,
    },
    include: {
      property: true,
      tenant: true,
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
    customer_email: request.tenant.email,

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

  if (!session.url) {
    throw new AppError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create payment session.",
    );
  }

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

const confirmPayment = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );

      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

export const paymentService = {
  createPayment,
  confirmPayment,
};
