import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreatePayment } from "./payment.interface";
import {
  PaymentProvider,
  PaymentStatus,
  RentalRequestStatus,
  UserRole,
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

const getMyPayments = async (tenantId: string) => {
  const result = await prisma.payment.findMany({
    where: {
      tenantId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      rentalRequest: {
        include: {
          property: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const getLandlordPayments = async (landlordId: string) => {
  const result = await prisma.payment.findMany({
    where: {
      rentalRequest: {
        property: {
          landlordId,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },

      rentalRequest: {
        include: {
          property: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const getSinglePayment = async (
  paymentId: string,
  userId: string,
  userRole: UserRole,
) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      rentalRequest: {
        include: {
          property: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(HttpStatus.NOT_FOUND, "Payment not found.");
  }

  //* Admin can access any payment
  if (userRole === UserRole.ADMIN) {
    return payment;
  }

  //* Tenant can access only their payment
  if (userRole === UserRole.TENANT && payment.tenantId === userId) {
    return payment;
  }

  //* Landlord can access only their property's payment
  if (
    userRole === UserRole.LANDLORD &&
    payment.rentalRequest.property.landlordId === userId
  ) {
    return payment;
  }

  throw new AppError(
    HttpStatus.FORBIDDEN,
    "You are not allowed to access this payment.",
  );
};

export const paymentService = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getLandlordPayments,
  getSinglePayment
};
