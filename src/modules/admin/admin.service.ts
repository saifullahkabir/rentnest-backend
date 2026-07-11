import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { IUpdateUserStatus } from "./admin.interface";
import AppError from "../../utils/AppError";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateUserStatus = async (
  userId: string,
  adminId: string,
  payload: IUpdateUserStatus,
) => {
  if (userId === adminId) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "You cannot update your own status.",
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, "User not found.");
  }

  if (
    payload.status !== UserStatus.ACTIVE &&
    payload.status !== UserStatus.BLOCKED
  ) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "Status must be ACTIVE or BLOCKED.",
    );
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: payload.status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return result;
};

const getAllRentalRequests = async () => {
  const result = await prisma.rentalRequest.findMany({
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
        select: {
          id: true,
          title: true,
          rentAmount: true,
          location: true,

          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
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

const getAllPayments = async () => {
  const result = await prisma.payment.findMany({
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
            select: {
              id: true,
              title: true,
              rentAmount: true,

              landlord: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result;
};

const getAllProperties = async () => {
  const result = await prisma.property.findMany({
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

    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllRentalRequests,
  getAllPayments,
  getAllProperties,
};
