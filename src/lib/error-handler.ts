import { NextResponse } from 'next/server';



/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handles errors and returns appropriate NextResponse
 */
export function handleError(error: unknown): NextResponse {
  // Log error for monitoring
  console.error('Error occurred:', {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Handle known AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle MongoDB errors
  if (error && typeof error === 'object' && 'name' in error) {
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error,
          },
        },
        { status: 400 }
      );
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid data format',
            code: 'CAST_ERROR',
          },
        },
        { status: 400 }
      );
    }

    if (error.name === 'MongoServerError' && 'code' in error) {
      if (error.code === 11000) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Duplicate entry',
              code: 'DUPLICATE_ERROR',
            },
          },
          { status: 409 }
        );
      }
    }
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';

  return NextResponse.json(
    {
      success: false,
      error: {
        message: isDevelopment
          ? (error instanceof Error ? error.message : 'Unknown error occurred')
          : 'An internal server error occurred',
        code: 'INTERNAL_ERROR',
        ...(isDevelopment && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
    },
    { status: 500 }
  );
}

/**
 * Async error wrapper for API routes
 */
export function asyncHandler(
  fn: (req: Request, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: Request, ...args: any[]): Promise<NextResponse> => {
    try {
      return await fn(req, ...args);
    } catch (error) {
      return handleError(error);
    }
  };
}

