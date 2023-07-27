import { Request, Response, NextFunction } from 'express';

// Use to catch async errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

export default catchAsync;
