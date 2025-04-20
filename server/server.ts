// server/server.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 개발 환경용
  },
});

io.on("connection", (socket) => {
  console.log("🟢 연결됨:", socket.id);

  socket.on("move", (data: { san: string }) => {
    console.log("📥 move 수신:", data);
    socket.broadcast.emit("move", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 연결 종료:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
