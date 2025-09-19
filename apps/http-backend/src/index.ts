import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateUserSchema, CreateSigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
        photo: "http.jpg.com",
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Error while signup, invalid credentials",
        success: false,
      });
    }
    res.status(200).json({
      user: user,
      success: true,
      message: "user signup successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error while signup",
      success: false,
      error,
    });
  }
});

app.post("/signin", async (req, res) => {
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

    const checkUser = await prismaClient.user.findFirst({
      where:{
        email:email
      }
    })

    if(!checkUser){
      return res.status(404).json({
        message:"Invalid email address, user mnot found",
        success:false
      })
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password) 

    if(!checkPassword){
      return res.status(404).json({
        message:"Invalid Password",
        success:false
      })
    }

    const token = jwt.sign({ id: checkUser.id }, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,       
      sameSite: "strict", 
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.status(200).json({
      message:"User signin successfully",
      success:true,
      token: token,
      user: checkUser
    });
  } catch (error) {
    return res.status(500).json({
      message:"Error while signin, server error",
      success:false,
      error
    })
  }
});

app.post("/room", middleware, (req, res) => {
  try {
    //db call
  } catch (error) {}
});

app.listen(3001);
