import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import {
  ICreateProperty,
  IPropertyQuery,
  IUpdateProperty,
} from "./property.interface";
import { Prisma } from "../../../generated/prisma/client";

const createProperty = async (payload: ICreateProperty, landlordId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new AppError(HttpStatus.NOT_FOUND, "Category not found.");
  }

  const result = await prisma.property.create({
    data: {
      ...payload,
      landlordId,
    },
  });

  return result;
};

const getMyProperties = async (landlordId: string) => {
  const result = await prisma.property.findMany({
    where: {
      landlordId,
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateProperty = async (
  propertyId: string,
  landlordId: string,
  payload: IUpdateProperty,
) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    throw new AppError(HttpStatus.NOT_FOUND, "Property not found.");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      "You are not allowed to update this property.",
    );
  }

  const result = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: {
      ...payload,
    },
  });

  return result;
};

const deleteProperty = async (propertyId: string, landlordId: string) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    throw new AppError(HttpStatus.NOT_FOUND, "Property not found.");
  }

  if (property.landlordId !== landlordId) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      "You are not allowed to delete this property.",
    );
  }

  await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });
};

const getAllProperties = async (query: IPropertyQuery) => {
  //* pagination
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  //* sorting
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: Prisma.PropertyWhereInput[] = [];

  //* searching
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  //* filtering
  if (query.location) {
    andConditions.push({
      location: {
        contains: query.location,
        mode: "insensitive",
      },
    });
  }

  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  if (query.availability) {
    andConditions.push({
      availability: query.availability,
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      rentAmount: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  const result = await prisma.property.findMany({
    where: {
      AND: andConditions,
    },

    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      category: true,
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const totalProperties = await prisma.property.count({
    where: {
      AND: andConditions,
    },
  });

  const totalPages = Math.ceil(totalProperties / limit);

  return {
    data: result,
    meta: {
      page,
      limit,
      total: totalProperties,
      totalPages,
    },
  };
};

export const propertyService = {
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getAllProperties,
};
