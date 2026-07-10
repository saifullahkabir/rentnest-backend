import { PropertyAvailability } from "../../../generated/prisma/enums";

export interface ICreateProperty {
  title: string;
  description: string;
  rentAmount: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  image: string;
  categoryId: string;
}

export interface IUpdateProperty {
  title?: string;
  description?: string;
  rentAmount?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  image?: string;
  categoryId?: string;
  availability?: PropertyAvailability;
}

export interface IPropertyQuery {
  searchTerm?: string;

  location?: string;
  categoryId?: string;
  availability?: PropertyAvailability;

  minPrice?: string;
  maxPrice?: string;

  page?: string;
  limit?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
