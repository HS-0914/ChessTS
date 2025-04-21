// RoomList.tsx
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type RoomListProps = {
  socket: Socket;
  onJoin: (roomId: string) => void;
};

function RoomList({ socket, onJoin }: RoomListProps) {
  const [rooms, setRooms] = useState<string[]>([]);
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    socket.emit("getRooms");

    socket.on("roomList", (roomList: string[]) => {
      console.log("roomList : ", roomList);
      setRooms(roomList);
    });

    socket.on("delete", (roomId: string) => {
      const remainRooms = rooms.filter((room) => room !== roomId);
      setRooms(remainRooms);
    });

    return () => {
      socket.off("roomList");
      socket.off("delete");
    };
  }, [socket]);

  const createRoom = () => {
    if (newRoomName.trim()) {
      onJoin(newRoomName.trim());
    }
  };

  const refreshRoom = () => {
    socket.emit("getRooms");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🏠 방 입장 또는 생성</h2>

      {/* 방 이름 입력 */}
      <input
        type="text"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
        placeholder="방 이름 입력"
        className="border px-2 py-1 rounded mr-2"
      />
      <button
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
        onClick={createRoom}
      >
        생성 및 입장
      </button>

      <button
        className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
        onClick={refreshRoom}
      >
        새로고침
      </button>

      {/* 방 목록 */}
      <ul className="space-y-2 mt-6">
        {rooms.map((room) => (
          <li key={room}>
            <button
              className="bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded w-full"
              onClick={() => onJoin(room)}
            >
              ▶ {room} 참가하기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomList;
