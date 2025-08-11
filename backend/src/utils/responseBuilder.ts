import { CreateResponse, ListResponse } from "../types/api.type";

export const buildSuccessResponse = <T>(
  data: T,
  message: string
): CreateResponse<T> => ({
  success: true,
  message,
  data,
});

export const buildListResponse = <T>(
  data: T[],
  message: string
): ListResponse<T> => ({
  success: true,
  message,
  data,
});
