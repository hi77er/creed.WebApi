import { Request, Response, NextFunction } from "express";
import { BaseCustomError, InvalidInputError } from "../errors";


const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BaseCustomError)
    return res.sendStatus(err.getStatusCode());

  return res.sendStatus(500);
};

export default errorHandler;