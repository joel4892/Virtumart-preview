import { NextFunction, Request, Response } from 'express';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export function asyncHandler(handler: Handler) {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(handler(req, res, next)).catch(next);
	};
}