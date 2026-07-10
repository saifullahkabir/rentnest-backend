import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import {
  ICreateRentalRequest,
  IUpdateRentalRequestStatus,
} from "./rentalRequest.interface";
import {
  PropertyAvailability,
  RentalRequestStatus,
} from "../../../generated/prisma/enums";

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

const getMyRequests = async (tenantId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      tenantId,
    },

    include: {
      property: {
        include: {
          category: true,

          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getLandlordRequests = async (landlordId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId,
      },
    },

    include: {
      property: {
        include: {
          category: true,
        },
      },

      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getSingleRentalRequest = async (requestId: string, userId: string) => {
  const request = await prisma.rentalRequest.findUnique({
    where: {
      id: requestId,
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

      property: {
        include: {
          category: true,

          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw new AppError(HttpStatus.NOT_FOUND, "Rental request not found.");
  }

  const isTenant = request.tenantId === userId;
  const isLandlord = request.property.landlordId === userId;

  if (!isTenant && !isLandlord) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      "You are not allowed to access this rental request.",
    );
  }

  return request;
};

const updateRentalRequestStatus = async (
  requestId: string,
  landlordId: string,
  payload: IUpdateRentalRequestStatus,
) => {
  const request = await prisma.rentalRequest.findUnique({
    where: {
      id: requestId,
    },

    include: {
      property: true,
    },
  });

  if (!request) {
    throw new AppError(HttpStatus.NOT_FOUND, "Rental request not found.");
  }

  if (request.property.landlordId !== landlordId) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      "You are not allowed to update this rental request.",
    );
  }

  if (request.status !== RentalRequestStatus.PENDING) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "This rental request has already been processed.",
    );
  }

  if (
    payload.status !== RentalRequestStatus.APPROVED &&
    payload.status !== RentalRequestStatus.REJECTED
  ) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "Status must be APPROVED or REJECTED.",
    );
  }

  const result = await prisma.rentalRequest.update({
    where: {
      id: requestId,
    },

    data: {
      status: payload.status,
    },
  });

  return result;
};

export const rentalRequestService = {
  createRentalRequest,
  getMyRequests,
  getLandlordRequests,
  getSingleRentalRequest,
  updateRentalRequestStatus,
};
