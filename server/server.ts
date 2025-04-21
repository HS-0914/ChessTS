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

const roomInfo: Record<string, string[]> = {}; // roomId -> socketId[]
const roomPGN: Record<string, string> = {}; // roomId → pgn

io.on("connection", (socket) => {
  console.log("🟢 연결됨:", socket.id);

  // 방 목록 가져오기
  socket.on("getRooms", () => {
    const availableRooms = Object.keys(roomInfo);
    console.log("availableRooms : ", availableRooms);
    // const availableRooms = Object.keys(roomInfo).filter(
    //   (roomId) => roomInfo[roomId].length < 2
    // );
    socket.emit("roomList", availableRooms);
  });

  // 방 참여
  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`📦 ${socket.id} joined room: ${roomId}`);
    (roomInfo[roomId] ??= []).push(socket.id);

    // 흰색/검정색 배정
    const color = roomInfo[roomId].length === 1 ? "w" : "b";
    socket.emit("assignColor", color);
    if (roomPGN[roomId]) {
      console.log(roomPGN[roomId]);
      socket.emit("initGame", { pgn: roomPGN[roomId] });
    }
  });

  // 기물 움직이기
  socket.on("move", ({ roomId, san, pgn }) => {
    roomPGN[roomId] = pgn; // 최신 pgn 저장
    socket.to(roomId).emit("move", san);
  });

  // 방 나가기
  socket.on("leave", (roomId) => {
    socket.leave(roomId);
    if (roomInfo[roomId]) {
      roomInfo[roomId] = roomInfo[roomId].filter((id) => id !== socket.id);
      if (roomInfo[roomId].length === 0) {
        delete roomInfo[roomId]; // 방 완전히 삭제
        delete roomPGN[roomId]; // ✅ PGN도 함께 제거
        socket.broadcast.emit("delete", roomId);
      }
    }
  });

  // 연결 해제
  socket.on("disconnect", () => {
    for (const roomId in roomInfo) {
      roomInfo[roomId] = roomInfo[roomId].filter((id) => id !== socket.id);
      if (roomInfo[roomId].length == 0) {
        delete roomInfo[roomId];
      }
    }

    console.log("🔴 연결 종료:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
