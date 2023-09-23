import { Exception } from "../models/exception";
import { NotFoundError } from "../models/notFoundError";
import { BadRequestError } from "../models/badRequestError";
import { NextFunction, Request, Response } from 'express';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction ) {

    if (error instanceof NotFoundError) {

        const exception: Exception = {
            code: 404,
            status: "NOT FOUND",
            message: error.message,
        }
        res.status(404).json(exception);

    } else if(error instanceof BadRequestError) {

        const exception: Exception = {
            code: 400,
            status: "BAD REQUEST",
            message: error.message,
        }
        res.status(400).json(exception);

    } else {
        const exception: Exception = {
            code: 500,
            status: "INTERNAL SERVER ERROR",
            message: error.message,
        }
        res.status(500).json(exception);
    }

}