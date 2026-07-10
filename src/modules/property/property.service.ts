import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateProperty } from "./property.interface";

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

export const propertyService = {
  createProperty,
};
