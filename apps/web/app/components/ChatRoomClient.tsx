"use client";

import { useEffect, useState } from "react";

import axios from "axios";
import { useSocket } from "../../hook/useScoket";
import { BACKEND_URL } from "../config";


type ChatMessage = { message: string; user?: string; timestamp?: string };

export function ChatRoomClient({ id }: { id: string }) {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [currentMsg, setCurrentMsg] = useState("");
  const { socket, loading } = useSocket();

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/chats/${id}`);
        setChats(res.data.messages);
      } catch (err) {
        console.error(err);
        setChats([{ message: "Failed to load messages" }]);
      }
    };
    fetchMessages();
  }, [id]);

  // Join room & listen for messages
  useEffect(() => {
    if (!socket) return;

    // Join room safely
    const joinRoom = () => {
      socket.send(JSON.stringify({ type: "join_room", roomId: id }));
      console.log(`Joined room ${id}`);
    };

    if (socket.readyState === WebSocket.OPEN) {
      joinRoom();
    } else {
      socket.addEventListener("open", joinRoom, { once: true });
    }

    // Handle incoming messages
    const handleMessage = (event: MessageEvent) => {
      const parsedData = JSON.parse(event.data);
      if (parsedData.type === "chat") {
        setChats((prev) => [...prev, { message: parsedData.message }]);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, id]);

  // Send message
  const sendMessage = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: id,
        message: currentMsg,
      })
    );
    setCurrentMsg("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Room: {id}</h2>

      <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 10 }}>
        {chats.map((el, i) => (
          <p key={i}>{el.message}</p>
        ))}
      </div>

      <input
        placeholder="Type a message..."
        value={currentMsg}
        onChange={(e) => setCurrentMsg(e.target.value)}
        style={{ padding: 8, width: "70%" }}
      />
      <button
        onClick={sendMessage}
        disabled={loading || !socket || socket.readyState !== WebSocket.OPEN}
        style={{ padding: 8, marginLeft: 10 }}
      >
        Send
      </button>

      {loading && <p>Connecting to chat...</p>}
    </div>
  );
}
