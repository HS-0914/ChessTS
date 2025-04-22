import { useEffect, useRef, useState } from "react";
import ChessSection from "./ChessSection";
import VsCom from "./VsCom";
import VsPlayer from "./VsPlayer";
import RoomList from "./RoomList";
import { io, Socket } from "socket.io-client";

function MyBoard() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const tabNames = ["vsCom", "vsPlayer", "log"];

  // 각각의 컴포넌트를 한 번만 생성
  const vsCom = useRef(<VsCom />);

  useEffect(() => {
    // const newSocket = io("http://localhost:3000");
    const newSocket = io("http://192.168.0.20:3000");
    setSocket(newSocket);

    newSocket.on("deleteColor", (roomId: string) => {
      sessionStorage.removeItem(`color-${roomId}`);
    });

    return () => {
      newSocket.off("deleteColor");
      newSocket.disconnect(); // 정리
    };
  }, []);

  useEffect(() => {
    // 탭 전환 시 window에 resize 이벤트를 강제로 발생시킴
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  }, [activeTab]);
  if (!socket) return null;
  return (
    <div id="myBoard">
      <ChessSection>
        {/* 탭 버튼 */}
        <div className="flex justify-center gap-4 mb-4">
          {tabNames.map((tab, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-md ${
                activeTab === idx
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab(idx)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div
          style={{
            visibility: activeTab === 0 ? "visible" : "hidden",
            height: activeTab === 0 ? "auto" : 0,
          }}
        >
          {vsCom.current}
        </div>
        <div
          style={{
            visibility: activeTab === 1 ? "visible" : "hidden",
            height: activeTab === 1 ? "auto" : 0,
          }}
        >
          {selectedRoom ? (
            <VsPlayer
              socket={socket}
              roomId={selectedRoom}
              onLeave={() => setSelectedRoom(null)}
            />
          ) : (
            <RoomList
              socket={socket}
              onJoin={(roomId) => setSelectedRoom(roomId)}
            />
          )}
        </div>
        <div style={{ display: activeTab === 2 ? "block" : "none" }}>
          {/* <VsCom /> */}
        </div>
      </ChessSection>
    </div>
  );
}

export default MyBoard;
