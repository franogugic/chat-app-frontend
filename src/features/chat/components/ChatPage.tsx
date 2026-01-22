// ChatPage.tsx
import { useState } from "react";
import { useAuth } from "../../auth/context/useAuth";

type User = {
  id: string;
  name: string;
};

const mockUsers: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlieeee" },
];

export function ChatPage() {
  const { user, logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-blue-600 text-white">
      <div className="w-1/4 border-r border-gray-700 flex flex-col p-4 bg-gray-800">
        <div className="flex flex-col mb-4">
          <input
            type="text"
            placeholder="Pretraži korisnike..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-3 rounded cursor-pointer ${
                  selectedUser?.id === u.id ? "bg-gray-600 font-semibold" : "hover:bg-gray-700"
                }`}
              >
                {u.name}
              </div>
            ))
          ) : (
            <p className="text-gray-400 mt-2">Započnite razgovor</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="text-xl font-semibold">{selectedUser ? selectedUser.name : "Odaberite korisnika"}</h2>
          <div className="flex items-center gap-4">
            <span>{user?.name}</span>
            <button
              onClick={logout}
              className="p-2 bg-red-500 rounded hover:bg-red-600 text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-900 flex flex-col gap-2">
          {selectedUser ? (
            <>
              <div className="self-start bg-gray-700 p-2 rounded max-w-xs">
                <p>Primjer poruke od {selectedUser.name}</p>
              </div>
              <div className="self-end bg-blue-600 p-2 rounded max-w-xs">
                <p>Tvoja poruka</p>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center mt-20">Odaberite korisnika da započnete razgovor</p>
          )}
        </div>

        {selectedUser && (
          <div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-2">
            <input
              type="text"
              placeholder="Napiši poruku..."
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none"
            />
            <button className="p-2 bg-blue-500 rounded hover:bg-blue-600 text-white">
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
