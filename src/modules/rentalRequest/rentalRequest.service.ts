import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateRentalRequest } from "./rentalRequest.interface";
import { PropertyAvailability } from "../../../generated/prisma/enums";

const createRentalRequest = async (
  tenantId: string,
  payload: ICreateRentalRequest,
) => {
  const property = await prisma.property.findUnique({
    where: {
      id: payload.propertyId,
    },
  });

  if (!property) {
    throw new AppError(HttpStatus.NOT_FOUND, "Property not found.");
  }

  //* check property availability
  if (property.availability === PropertyAvailability.UNAVAILABLE) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "This property is not available.",
    );
  }

  //*  check duplicate request
  const isRequestExists = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
    },
  });

  if (isRequestExists) {
    throw new AppError(
      HttpStatus.CONFLICT,
      "You have already requested this property.",
    );
  }

  const result = await prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate,
      message: payload.message,
    },
  });

  return result;
};

export const rentalRequestService = {
  createRentalRequest,
};
