import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("authorization"); 

    if (!token) {
      return res.status(401).json({
        message: "Authorization token missing",
        success: false,
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "object" && "id" in decoded) {
      (req as any).userId = (decoded as JwtPayload).id;
      next(); 
    } else {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized: invalid or expired token",
      success: false,
    });
  }
};
