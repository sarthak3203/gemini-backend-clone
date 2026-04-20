import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../app/auth/AuthContext";
import { ApiError } from "../../lib/api";
import { backend } from "../../lib/backend";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";

function formatSender(sender) {
  if (sender === "USER") return "You";
  if (sender === "GEMINI") return "Gemini";
  return sender || "Unknown";
}

export function ChatPage() {
  const { token } = useAuth();

  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const [activeRoom, setActiveRoom] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendInfo, setSendInfo] = useState("");
  const [sendError, setSendError] = useState("");

  const canCreateRoom = useMemo(() => newTitle.trim().length >= 2, [newTitle]);
  const canSend = useMemo(() => text.trim().length > 0 && Boolean(activeRoom), [text, activeRoom]);

  const loadRooms = useCallback(async () => {
    setRoomsError("");
    setRoomsLoading(true);
    try {
      const res = await backend.chatroom.list(token);
      setRooms(res?.chatrooms || []);
    } catch (e) {
      setRoomsError(e.message || "Failed to load chatrooms");
    } finally {
      setRoomsLoading(false);
    }
  }, [token]);

  async function createRoom() {
    setRoomsError("");
    try {
      await backend.chatroom.create(token, { title: newTitle.trim() });
      setNewTitle("");
      await loadRooms();
    } catch (e) {
      setRoomsError(e.message || "Failed to create chatroom");
    }
  }

  async function loadThread(room) {
    setThreadError("");
    setThreadLoading(true);
    try {
      const res = await backend.chatroom.getById(token, room.id);
      setMessages(res?.data?.messages || []);
    } catch (e) {
      setThreadError(e.message || "Failed to load chatroom");
      setMessages([]);
    } finally {
      setThreadLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  async function selectRoom(room) {
    setActiveRoom(room);
    await loadThread(room);
  }

  async function sendMessage() {
    if (!activeRoom) return;
    const nextText = text.trim();
    if (!nextText) return;

    setSendError("");
    setSendInfo("");
    setSendLoading(true);

    const optimisticUser = { sender: "USER", message_text: nextText };
    setMessages((m) => [...m, optimisticUser]);
    setText("");

    try {
      const res = await backend.chatroom.sendMessage(token, activeRoom.id, { text: nextText });
      if (res?.gemini_reply) {
        setMessages((m) => [...m, { sender: "GEMINI", message_text: res.gemini_reply }]);
      } else {
        setSendInfo("Response is processing in queue. Click refresh to fetch the Gemini reply.");
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setSendError(e.message);
      } else {
        setSendError(e.message || "Failed to send message");
      }
    } finally {
      setSendLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[330px_1fr]">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">Rooms</div>
            <h2 className="mt-1 text-xl font-bold tracking-tight">Chatrooms</h2>
          </div>
          {roomsLoading && <Spinner />}
        </div>

        {roomsError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {roomsError}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New room title" />
          <Button variant="secondary" onClick={createRoom} disabled={!canCreateRoom || roomsLoading}>
            Create
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {!roomsLoading && rooms.length === 0 && (
            <div className="rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-3 text-sm text-[rgb(var(--text-muted))]">
              No chatrooms yet. Create your first room.
            </div>
          )}

          {rooms.map((room) => {
            const active = activeRoom?.id === room.id;
            return (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50/80 shadow-sm"
                    : "border-[rgb(var(--border))] bg-white hover:-translate-y-0.5 hover:bg-[rgb(var(--muted))]"
                }`}
              >
                <div className="font-semibold">{room.title}</div>
                <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">Room #{room.id}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        {!activeRoom ? (
          <div className="grid min-h-[500px] place-items-center rounded-2xl border border-dashed border-[rgb(var(--border))] bg-white/60">
            <div className="px-4 text-center">
              <h3 className="text-lg font-bold tracking-tight">Choose a chatroom to begin</h3>
              <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
                This screen maps to `GET /chatroom/:id` and `POST /chatroom/:id/message`.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[560px] flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-[rgb(var(--border))] pb-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]">
                  Active room
                </div>
                <h3 className="mt-1 text-lg font-bold tracking-tight">{activeRoom.title}</h3>
              </div>
              <Button variant="secondary" onClick={() => loadThread(activeRoom)} disabled={threadLoading}>
                {threadLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {threadError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {threadError}
              </div>
            )}

            <div className="mt-4 flex-1 space-y-2 overflow-auto rounded-2xl border border-[rgb(var(--border))] bg-white/80 p-3">
              {threadLoading && messages.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
                  <Spinner /> Loading messages...
                </div>
              )}
              {!threadLoading && messages.length === 0 && (
                <div className="text-sm text-[rgb(var(--text-muted))]">No messages yet. Start the conversation.</div>
              )}

              {messages.map((message, index) => {
                const mine = message.sender === "USER";
                return (
                  <div key={`${message.sender}-${index}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[90%] rounded-2xl border px-3 py-2.5 text-sm ${
                        mine
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-[rgb(var(--border))] bg-[rgb(var(--muted))]"
                      }`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
                        {formatSender(message.sender)}
                      </div>
                      <div className="mt-1 whitespace-pre-wrap leading-relaxed text-[rgb(var(--text))]">
                        {message.message_text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sendError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {sendError}
              </div>
            )}
            {sendInfo && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {sendInfo}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask Gemini anything..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!sendLoading) sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={!canSend || sendLoading}>
                {sendLoading ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
