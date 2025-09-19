import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateUserSchema, CreateSigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
const app = express();

app.post("/signup", async (req, res) => {
  try {
    const parseData = CreateUserSchema.safeParse(req.body);
    if (!parseData.success) {
      return res.status(404).json({
        message: "Zod validation error",
        success: false,
        errors: parseData.error.flatten().fieldErrors,
      });
    }

    const { username, email, password } = parseData.data;

    

    const user = await prismaClient.user.create({
      data: {
        
        email: email,
        username: username,
        password: password,
        photo: "http.jpg.com",
      },
    });

    if(!user){
      return res.status(404).json({
        message:"Error while signup, invalid credentials",
        success:false
      })
    }
    res.status(200).json({
      user:user,
      success:true,
      message:"user signup successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message:"Server Error while signup",
      success:false,
      error
    })
  }
});

app.post("/signin", (req, res) => {
  try {
    const parseData = CreateSigninSchema.safeParse(req.body);
    if (!parseData.success) {
      return res.status(404).json({
        message: "Zod validation error",
        success: false,
        errors: parseData.error.flatten().fieldErrors,
      });
    }
    const { email, password } = parseData.data;

    const id = 1;
    const token = jwt.sign(
      {
        id,
      },
      JWT_SECRET
    );

    res.json({
      token: token,
    });
  } catch (error) {}
});

app.post("/room", middleware, (req, res) => {
  try {
    //db call
  } catch (error) {}
});

app.listen(3001);
