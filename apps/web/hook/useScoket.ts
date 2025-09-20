"use client";

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../app/config"; // Your WebSocket URL

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0MzU5OTIyLThmNzYtNGE5OC0
//             4ZTRkLTM2NGU0YmM4Zjk1YSIsImlhdCI6MTc1ODM3Nzg3NywiZXhwIjoxNzU4NDY0Mjc3fQ.LWHJDZPZysVT9H7XxdfBfqpyNSGDzx
//             StR9q73uxTBsM`); // add token if needed: `${WS_URL}?token=...`

      ws.onopen = () => {
        setLoading(false);
        setSocket(ws);
        console.log("WebSocket connected");
      };

      ws.onclose = () => {
        console.warn("WebSocket closed. Reconnecting...");
        setLoading(true);
        setSocket(null);

        reconnectTimeout.current = setTimeout(connect, 1000); // reconnect after 1s
      };

      ws.onerror = (err) => {
        console.error("WebSocket error", err);
        ws.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      socket?.close();
    };
  }, []);

  return { socket, loading };
}


// "use client";

// import { useEffect, useRef, useState } from "react";
// import { WS_URL } from "../app/config";

// export function useSocket() {
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const connect = () => {
//       const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0MzU5OTIyLThmNzYtNGE5OC0
//             4ZTRkLTM2NGU0YmM4Zjk1YSIsImlhdCI6MTc1ODM3Nzg3NywiZXhwIjoxNzU4NDY0Mjc3fQ.LWHJDZPZysVT9H7XxdfBfqpyNSGDzx
//             StR9q73uxTBsM`);; // add token if needed: `${WS_URL}?token=...`

//       ws.onopen = () => {
//         setLoading(false);
//         setSocket(ws);
//         console.log("WebSocket connected");
//       };

//       ws.onclose = () => {
//         console.warn("WebSocket closed. Reconnecting...");
//         setLoading(true);
//         setSocket(null);

//         // try reconnect after 1s
//         reconnectTimeout.current = setTimeout(connect, 1000);
//       };

//       ws.onerror = (err) => {
//         console.error("WebSocket error", err);
//         ws.close();
//       };
//     };

//     connect();

//     return () => {
//       if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
//       socket?.close();
//     };
//   }, []);

//   return { socket, loading };
// }
