import { useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError } from "../../lib/api";
import { useAuth } from "../../app/auth/AuthContext";
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

  async function loadRooms() {
    setRoomsError("");
    setRoomsLoading(true);
    try {
      const res = await apiRequest("/chatroom", { token });
      setRooms(res?.chatrooms || []);
    } catch (e) {
      setRoomsError(e.message || "Failed to load chatrooms");
    } finally {
      setRoomsLoading(false);
    }
  }

  async function createRoom() {
    setRoomsError("");
    try {
      await apiRequest("/chatroom", { method: "POST", token, data: { title: newTitle.trim() } });
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
      const res = await apiRequest(`/chatroom/${room.id}`, { token });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
      const res = await apiRequest(`/chatroom/${activeRoom.id}/message`, {
        method: "POST",
        token,
        data: { text: nextText },
      });

      if (res?.gemini_reply) {
        setMessages((m) => [...m, { sender: "GEMINI", message_text: res.gemini_reply }]);
      } else {
        setSendInfo("Reply is processing. Refresh the room in a few seconds to see it.");
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Chatrooms</div>
            <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">Create and switch rooms</div>
          </div>
          {roomsLoading && <Spinner />}
        </div>

        {roomsError && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{roomsError}</div>
        )}

        <div className="mt-4 flex gap-2">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New room title" />
          <Button variant="secondary" onClick={createRoom} disabled={!canCreateRoom || roomsLoading}>
            Create
          </Button>
        </div>

        <div className="mt-4 space-y-1">
          {!roomsLoading && rooms.length === 0 && (
            <div className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--muted))] px-3 py-2 text-sm text-[rgb(var(--text-muted))]">
              No chatrooms yet. Create your first room.
            </div>
          )}
          {rooms.map((r) => {
            const active = activeRoom?.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => selectRoom(r)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[rgb(var(--border))] bg-white hover:bg-[rgb(var(--muted))]"
                }`}
              >
                <div className="font-medium">{r.title}</div>
                <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">id: {r.id}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        {!activeRoom ? (
          <div className="grid min-h-[380px] place-items-center">
            <div className="text-center">
              <div className="text-sm font-semibold">Select a chatroom</div>
              <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">Choose a room on the left to view messages.</div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[520px] flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-[rgb(var(--border))] pb-3">
              <div>
                <div className="text-sm font-semibold">{activeRoom.title}</div>
                <div className="mt-0.5 text-xs text-[rgb(var(--text-muted))]">Messages are stored per room.</div>
              </div>
              <Button variant="secondary" onClick={() => loadThread(activeRoom)} disabled={threadLoading}>
                {threadLoading ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            {threadError && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{threadError}</div>
            )}

            <div className="mt-4 flex-1 space-y-2 overflow-auto rounded-lg border border-[rgb(var(--border))] bg-white p-3">
              {threadLoading && messages.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
                  <Spinner /> Loading messages…
                </div>
              )}
              {!threadLoading && messages.length === 0 && (
                <div className="text-sm text-[rgb(var(--text-muted))]">No messages yet. Send the first one.</div>
              )}
              {messages.map((m, idx) => {
                const mine = m.sender === "USER";
                return (
                  <div key={idx} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl border px-3 py-2 text-sm ${
                        mine
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-[rgb(var(--border))] bg-[rgb(var(--muted))]"
                      }`}
                    >
                      <div className="text-[11px] font-medium text-[rgb(var(--text-muted))]">{formatSender(m.sender)}</div>
                      <div className="mt-1 whitespace-pre-wrap text-[rgb(var(--text))]">{m.message_text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sendError && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{sendError}</div>
            )}
            {sendInfo && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{sendInfo}</div>
            )}

            <div className="mt-3 flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!sendLoading) sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={!canSend || sendLoading}>
                {sendLoading ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

