import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateCategory } from "./category.interface";

const createCategory = async (payload: ICreateCategory) => {
  const name = payload.name.trim().replace(/\s+/g, " ");

  if (!name) {
    throw new AppError(HttpStatus.BAD_REQUEST, "Category name is required.");
  }

  const formattedName =
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const isCategoryExists = await prisma.category.findUnique({
    where: {
      name: formattedName,
    },
  });

  if (isCategoryExists) {
    throw new AppError(HttpStatus.CONFLICT, "Category already exists.");
  }

  const result = await prisma.category.create({
    data: {
      name: formattedName,
    },
  });

  return result;
};

export const categoryService = {
  createCategory,
};
