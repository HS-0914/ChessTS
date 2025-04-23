"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/server.ts
const chess_js_1 = require("chess.js");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // 개발 환경용
    },
});
const roomInfo = {}; // roomId -> socketId[]
const roomPGN = {}; // roomId → pgn
const game = new chess_js_1.Chess();
io.on("connection", (socket) => {
    console.log("🟢 연결됨:", socket.id);
    // 방 목록 가져오기
    socket.on("getRooms", () => {
        // const availableRooms = Object.keys(roomInfo);
        const availableRooms = Object.keys(roomInfo).filter((roomId) => roomInfo[roomId].length < 2);
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
            socket.emit("initGame", roomPGN[roomId]);
        }
    });
    // 기물 움직이기
    socket.on("move", ({ roomId, pgn }) => {
        roomPGN[roomId] = pgn; // 최신 pgn 저장
        console.log(roomPGN[roomId]);
        socket.to(roomId).emit("move", pgn);
    });
    // 무르기 요청 → 상대에게 전달
    socket.on("undoRequest", (roomId) => {
        socket.to(roomId).emit("undoRequest");
    });
    // 무르기 수락
    socket.on("undoAccept", (roomId) => {
        game.loadPgn(roomPGN[roomId]);
        game.undo();
        game.undo();
        roomPGN[roomId] = game.pgn();
        socket.to(roomId).emit("undoAccept");
    });
    // 무르기 거절
    socket.on("undoReject", (roomId) => {
        socket.to(roomId).emit("undoReject");
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
                socket.emit("deleteColor", roomId);
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
