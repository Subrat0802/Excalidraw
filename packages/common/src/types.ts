import {z} from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(2, "Username must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(3, "Password must be at least 3 characters")
})

export const CreateSigninSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(3, "Password must be at least 3 characters")
})

export const CreateRoomSchema = z.object({
    name: z.string().min(2, "invalid room name, name must be at least 2 characters")
})