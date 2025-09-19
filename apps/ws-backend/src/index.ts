import WebSocket, { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  id: string;
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decode = jwt.verify(token, JWT_SECRET);
    if (typeof decode === "string") {
      return null;
    }
    if (!decode || decode.userId) {
      return null;
    }
    return decode.userId;
  } catch (error) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);
  if (userId === null) {
    ws.close();
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    let parsedData;
    try {
      parsedData = JSON.parse(data.toString());
    } catch (err) {
      console.error("Invalid JSON received:", data.toString());
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid JSON format",
        })
      );
      return; // stop processing this message
    }
    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      // find the user who sent the message
      const sender = users.find((x) => x.ws === ws);
      if (!sender) {
        return;
      }

      // Save chat in DB
      await prismaClient.chat.create({
        data: {
          message,
          userId: sender.id, // <-- store sender’s DB id
          room: {
            connect: { id: roomId }, // <-- connect to existing room
          },
        },
      });

      // Broadcast message to everyone in the room
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
              senderId: sender.id,
            })
          );
        }
      });
    }
  });
});
