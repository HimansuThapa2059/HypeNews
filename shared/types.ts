export type successResponse<T = void> = {
  success: true;
  message: string;
} & (T extends void ? {} : { data: T });

export type errorResponse = {
  success: false;
  error: string;
  isFormError?: boolean;
};
