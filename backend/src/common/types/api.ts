export type SuccessResponse<T> = { success: true; data: T };

export type FailureResponse = {
  success: false;
  error: { code: string; message: string; requestId?: string };
};
