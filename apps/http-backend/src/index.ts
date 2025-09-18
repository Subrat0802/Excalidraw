import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {CreateUserSchema, CreateSigninSchema} from "@repo/common/types";

const app = express();

app.post("/signup", (req, res) => {
    try{
        const parseData = CreateUserSchema.safeParse(req.body);
        if(!parseData.success){
            return res.status(404).json({
                message:"Zod validation error",
                success:false,
                errors: parseData.error.flatten().fieldErrors,
            })
        }
        const {username, email, password} = parseData.data;
        res.json({
            userId: 123
        })

    }catch(error){

    }
})

app.post("/signin", (req, res) => {
    try{
        const parseData = CreateSigninSchema.safeParse(req.body);
        if(!parseData.success) {
            return res.status(404).json({
                message:"Zod validation error",
                success:false,
                errors:parseData.error.flatten().fieldErrors
            })
        }
        const {email, password} = parseData.data;

        const id = 1;
        const token = jwt.sign({
            id
        }, JWT_SECRET)

        res.json({
            token: token
        })
        
    }catch(error){

    }
})

app.post("/room", middleware, (req, res) => {
    try{
        //db call
    }catch(error){

    }
})

app.listen(3001);