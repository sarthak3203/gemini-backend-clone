import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../../app/auth/AuthContext";
import { ApiError } from "../../lib/api";
import { backend } from "../../lib/backend";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";

function formatSender(sender) {
  if (sender === "USER") return "You";
  if (sender === "GEMINI") return "Gemini AI";
  return sender || "Unknown";
}

export function ChatPage() {
  const { token } = useAuth();
  const scrollRef = useRef(null);

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="flex h-[calc(100vh-120px)] flex-col gap-4 lg:flex-row">
      {/* Sidebar: Chatrooms */}
      <Card className="flex flex-col lg:w-[350px] overflow-hidden border-none shadow-md ring-1 ring-border/50">
        <div className="p-5 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight">Conversations</h2>
            {roomsLoading && <Spinner className="h-4 w-4" />}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              placeholder="Room name..." 
              className="h-9 text-sm"
            />
            <Button size="sm" onClick={createRoom} disabled={!canCreateRoom || roomsLoading}>
              New
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {rooms.length === 0 && !roomsLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground italic">
              No rooms found
            </div>
          )}
          {rooms.map((room) => {
            const active = activeRoom?.id === room.id;
            return (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`group flex w-full flex-col items-start rounded-lg px-4 py-3 transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-sm font-semibold truncate w-full">{room.title}</span>
                <span className={`text-[10px] uppercase tracking-wider opacity-70 ${active ? "text-white" : "text-muted-foreground"}`}>
                  ID: {room.id}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden border-none shadow-md ring-1 ring-border/50 bg-muted/20">
        {!activeRoom ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <div className="mb-4 rounded-full bg-primary/10 p-6 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 className="text-xl font-bold">Select a chatroom</h3>
            <p className="mx-auto mt-2 max-w-[280px] text-sm text-muted-foreground">
              Choose an existing room or create a new one to start chatting with Gemini AI.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b bg-background/50 px-6 py-4 backdrop-blur-md">
              <div>
                <h3 className="text-base font-bold leading-none">{activeRoom.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Connected to Gemini</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => loadThread(activeRoom)} disabled={threadLoading}>
                <svg className={`mr-2 h-4 w-4 ${threadLoading ? "animate-spin" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><polyline points="22 4 22 10 16 10"/></svg>
                Sync
              </Button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.map((message, index) => {
                const isUser = message.sender === "USER";
                return (
                  <div key={`${message.sender}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`group relative flex max-w-[85%] flex-col gap-1`}>
                      <span className={`text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 ${isUser ? "text-right" : "text-left"}`}>
                        {formatSender(message.sender)}
                      </span>
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-background border border-border/50 text-foreground rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{message.message_text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {threadLoading && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border/50 rounded-2xl rounded-tl-none px-4 py-3">
                    <Spinner className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="border-t bg-background p-4 px-6">
              {sendError && <p className="mb-2 text-xs font-medium text-red-500 animate-in fade-in">{sendError}</p>}
              {sendInfo && <p className="mb-2 text-xs font-medium text-amber-600 animate-in fade-in">{sendInfo}</p>}
              
              <div className="flex items-center gap-3">
                <Input
                  className="flex-1 h-11 border-muted focus-visible:ring-primary"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!sendLoading && canSend) sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!canSend || sendLoading} 
                  className="h-11 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  {sendLoading ? <Spinner className="h-4 w-4" /> : "Send"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}