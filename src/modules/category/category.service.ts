import HttpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

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

const getAllCategories = async () => {
  const result = await prisma.category.findMany();

  return result;
};

const updateCategory = async (categoryId: string, payload: IUpdateCategory) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError(HttpStatus.NOT_FOUND, "Category not found.");
  }

  const name = payload.name?.trim().replace(/\s+/g, " ");

  const formattedName =
    name?.charAt(0).toUpperCase() + name?.slice(1).toLowerCase();

  const result = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name: formattedName,
    },
  });

  return result;
};

const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError(HttpStatus.NOT_FOUND, "Category not found.");
  }

  const property = await prisma.property.findFirst({
    where: {
      categoryId,
    },
  });

  if (property) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      "Cannot delete category because it is being used by properties.",
    );
  }

  const result = await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return result;
};

export const categoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
