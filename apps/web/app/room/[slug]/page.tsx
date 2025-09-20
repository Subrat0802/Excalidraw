import axios from "axios";
import { ChatRoomClient } from "../../components/ChatRoomClient";
import { BACKEND_URL } from "../../config";


async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
  return response.data.roomId.id;
}

export default async function ChatRoomPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const roomId = await getRoomId(slug);

  return (
    <div>
      <h1>Welcome to room {roomId}</h1>
      {/* ChatRoomClient is a client component */}
      <ChatRoomClient id={roomId} />
    </div>
  );
}
