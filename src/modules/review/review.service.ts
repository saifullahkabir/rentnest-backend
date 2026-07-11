import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateReview } from "./review.interface";
import { RentalRequestStatus } from "../../../generated/prisma/enums";

const createReview = async (tenantId: string, payload: ICreateReview) => {
  const property = await prisma.property.findUnique({
    where: {
      id: payload.propertyId,
    },
  });

  if (!property) {
    throw new AppError(HttpStatus.NOT_FOUND, "Property not found.");
  }

  const rentalRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: RentalRequestStatus.COMPLETED,
    },
  });

  if (!rentalRequest) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "You can only review a property after completing the rental.",
    );
  }

  const reviewExists = await prisma.review.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
    },
  });

  if (reviewExists) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "You have already reviewed this property.",
    );
  }

  if (payload.rating < 1 || payload.rating > 5) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "Rating must be between 1 and 5.",
    );
  }

  const result = await prisma.review.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      rating: payload.rating,
      comment: payload.comment,
    },

    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });

  return result;
};

export const reviewService = {
  createReview,
};
