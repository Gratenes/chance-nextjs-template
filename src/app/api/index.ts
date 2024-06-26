/*
 * For all Api routes responses use custom handler for data normalization
 *
 * Consistency is key - Random Person
 * */

/**
 * Sends an error response with the given status and message.
 *
 * @param {number} status - The HTTP status code of the error response.
 * @param {string} message - The error message to be included in the response.
 * @returns {object} - The error response object.
 */
export const sendErrorResponse = (status: number, message: string) => {
  return new Response(
    JSON.stringify({
      success: false,
      status: status,
      message: message,
    }),
    {
      status: status,
      statusText: message,
    },
  );
};
export const sendErrorAction = (
  status: number,
  message: string,
): ErrorResult => {
  return {
    success: false,
    status: status,
    message: message,
  };
};
export type ErrorResult = { success: false; message: string; status?: number };

/**
 * Creates a JSON response object with optional status code.
 *
 * @param {any} data - The data to be included in the response.
 * @param {number} [code] - The optional status code for the response.
 * @returns {object} - The JSON response object.
 */
export const sendJsonResponse = (data: any = {}, code?: number) => {
  return new Response(
    JSON.stringify({
      success: true,
      data: data,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      status: code,
    },
  );
};

export const sendJsonAction = <T>(data: T, code?: number): JsonResult<T> => {
  return {
    success: true,
    data: data,
  };
};

export type JsonResult<T = any> = { success: true; data: T };

/**
 * Redirects to the error page with the provided status and message.
 *
 * @param {number} status - The HTTP status code of the error.
 * @param {string} message - The error message.
 */
export const sendErrorRedirectResponse = (status: number, message: string) => {
  return Response.redirect(
    `${process.env.NEXTAUTH_URL}/api/auth/error?message=${message}&code=${status}`,
    302,
  );
};

export type ApiResult<T = any> = JsonResult<T> | ErrorResult;

export const sendActionAsResponse = (action: ApiResult) => {
  if (action.success) {
    return sendJsonResponse(action.data);
  } else {
    return sendErrorResponse(action.status || 402, action.message);
  }
};

