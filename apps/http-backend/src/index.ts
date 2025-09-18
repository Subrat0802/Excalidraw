import express from "express";
import {success, z} from "zod";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { middleware } from "./middleware";

const app = express();

const signupZodValidation = z.object({
    username: z.string().min(2, "username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
}) 

const signinZodValidation = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

app.post("/signup", (req, res) => {
    try{
        const parseData = signupZodValidation.safeParse(req.body);
        if(!parseData.success){
            return res.status(404).json({
                message:"Zod validation error",
                success:false,
                errors: parseData.error.flatten().fieldErrors,
            })
        }
        const {username, email, password} = parseData.data;
        

    }catch(error){

    }
})

app.post("/signin", (req, res) => {
    try{
        const parseData = signinZodValidation.safeParse(req.body);
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