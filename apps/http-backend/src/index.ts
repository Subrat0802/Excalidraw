import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateUserSchema, CreateSigninSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { success } from "zod";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // if you want cookies/token headers sent
  })
);
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

    const existingUser = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already registered with this same email address",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
        photo: `https://api.dicebear.com/5.x/initials/svg?seed=${username}`,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Error while signup, invalid credentials",
        success: false,
      });
    }

    const { password: _, ...safeUser } = user;

    res.status(200).json({
      user: safeUser,
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
      where: {
        email: email,
      },
    });

    if (!checkUser) {
      return res.status(404).json({
        message: "Invalid email address, user not found",
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password);

    if (!checkPassword) {
      return res.status(404).json({
        message: "Invalid Password",
        success: false,
      });
    }

    const token = jwt.sign({ id: checkUser.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    const { password: _, ...safeUser } = checkUser;

    res.status(200).json({
      message: "User signin successfully",
      success: true,
      token: token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while signin, server error",
      success: false,
      error,
    });
  }
});

app.post("/room", middleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const { name } = req.body;

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({
      message: "Admin user not found",
      success: false,
    });
  }

  if (!name) {
    return res.status(400).json({
      message: "Name is required",
      success: false,
    });
  }

  try {
    const createRoom = await prismaClient.room.create({
      data: {
        slug: name,
        adminId: userId,
      },
    });

    return res.status(201).json({
      message: "Room created successfully",
      success: true,
      data: createRoom, // returning room details
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating room",
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where:{
      roomId: roomId
    },
    orderBy:{
      id:"desc"
    },
    take:50
  })

  if(!messages){
    return res.status(403).json({
      message:"Error while fetting last messages",
      success:false
    })
  }

  res.status(200).json({
    messages:messages,
    success:true,
    message:"Last 50 messages"
  })
})

app.get("/room/:slug", async (req, res) => {
  try{
    const slug = req.params.slug;
    console.log(slug)
    const roomId = await prismaClient.room.findFirst({
      where:{
        slug
      }
    })
    if(!roomId){
      return res.status(404).json({
        message:"Error while getting room id",
        success: false
      })
    }

    console.log("roomId", roomId)
    return res.status(200).json({
      roomId:roomId,
      message:"room id",
      success:true
    })
  }catch(error){
    return res.status(500).json({
      message:"Server error while getting roomid using slug",
      success:false,
      error:error
    })
  }
})

app.get("/test", (req, res) => {
  res.send("Hello");
})

app.listen(3001);
