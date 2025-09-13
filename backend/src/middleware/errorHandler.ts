import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

// 커스텀 에러 클래스
export class CustomError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'CustomError';
  }
}

// 404 핸들러
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// 글로벌 에러 핸들러
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // JWT 에러 처리
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Validation 에러 처리
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // Database 에러 처리
  if (error.message?.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // 개발 환경에서는 상세 에러 정보 포함
  const errorResponse: any = {
    success: false,
    error: message,
    statusCode
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = error.details;
  }

  // 에러 로깅
  console.error(`Error ${statusCode}: ${message}`);
  if (statusCode >= 500) {
    console.error(error.stack);
  }

  res.status(statusCode).json(errorResponse);
};

// 비동기 에러 캐처
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};