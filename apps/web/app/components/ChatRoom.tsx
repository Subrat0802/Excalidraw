"use client";

import { ChatRoomClient } from "../components/ChatRoomClient";

export default function RoomPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  // Only pass room id; messages fetched inside ChatRoomClient
  return <ChatRoomClient id={slug} />;
}


// "use client";
// import axios from "axios";
// import { BACKEND_URL } from "../config";
// import { useEffect, useState } from "react";

// type Message = {
//   id: number;
//   message: string;
//   roomId: number;
//   userId: number;
// };

// const ChatRoom = ({ id }: { id: string }) => {
//   const [messages, setMessages] = useState<Message[]>([]);

//   const getMsgs = async (roomId: string) => {
//     try {
//       const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
//       setMessages(response.data.messages);
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//     }
//   };

//   useEffect(() => {
//     if (id) {
//       getMsgs(id);
//     }
//   }, [id]);

// //   console.log("messages", messages);

//   return (
//     <div>
//       <p>CHAT ROOM</p>
//       {messages.length === 0 ? <p>Loading...</p> : messages.map((el) => (
//         <div key={el.id}>
//           <p>{el.message}</p>
//         </div>
//       ))}

//       <div>
//         <input placeholder="Message"/>
//         <button>Send message</button>
//       </div>
//     </div>
//   );
// };

// export default ChatRoom;
