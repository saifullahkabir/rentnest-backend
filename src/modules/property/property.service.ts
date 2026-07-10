import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateProperty, IUpdateProperty } from "./property.interface";

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

export const propertyService = {
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
