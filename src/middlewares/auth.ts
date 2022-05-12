import passport from "passport";
import httpStatus from "http-status";
import { roleRights } from "../config/roles";
import { ApiError } from "../utils";
import { Request, Response, NextFunction } from "express";
//TODO: change any types

// Verify Callback
const verifyCallback = (req: Request, resolve: any, reject: any, requiredRights: any) => async (err: any, user: any, info: any) => {
    if (err || info || !user) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;
    if (requiredRights.length) {
        const userRights: any = roleRights.get(user.role);
        const hasRequiredRights = requiredRights.every((requiredRight: any) => {
            return userRights.includes(requiredRight)
        });
        if (!hasRequiredRights && req.params.userId !== user.id) {
            return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        }
        if (!hasRequiredRights) {
            return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        }
    }
    resolve();
};

// JWT Auth (rest parameter)
const auth = (...requiredRights: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
        .then(() => next())
        .catch((err) => next(err));
};

export default auth;