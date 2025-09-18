import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { success } from "zod";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
    try{
        const header = req.header("authorization") ?? "";

        const decode = jwt.verify(header, JWT_SECRET);

        if(decode){
            //@ts-ignore. //todo fix it
            req.userId = decode.id;
            res.json({
                messsage:"Token is authorized",
                success:true
            })
            next();
        }else{
            res.json({
                message:"Error while authorize token",
                success:false
            })
        }
    }catch(error){

    }
}