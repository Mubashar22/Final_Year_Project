"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  property: {
    id: string;
    title: string;
    location: string;
  };
}

interface Conversation {
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  messages: Message[];
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchMessages();
    }
  }, [status, router]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data: Message[] = await res.json();
      
      // Group by property + other user
      const grouped: { [key: string]: Conversation } = {};
      data.forEach((msg) => {
        const isSender = msg.sender.id === session?.user?.id;
        const otherUser = isSender ? msg.receiver : msg.sender;
        const key = `${msg.property.id}|${otherUser.id}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            propertyId: msg.property.id,
            propertyTitle: msg.property.title,
            propertyLocation: msg.property.location,
            otherUser: {
              id: otherUser.id,
              name: otherUser.name,
              email: otherUser.email,
            },
            messages: [],
          };
        }
        grouped[key].messages.push(msg);
      });
      setConversations(Object.values(grouped));
    } catch (e) {
      console.error("Error fetching messages:", e);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === null || !reply.trim()) return;
    
    setSending(true);
    setError(null);
    
    const conv = conversations[selected];
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: conv.propertyId,
          receiverId: conv.otherUser.id,
          message: reply.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      setReply("");
      await fetchMessages(); // Refresh messages after sending
    } catch (e) {
      console.error("Error sending message:", e);
      setError(e instanceof Error ? e.message : "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (message: Message) => {
    setEditingMessage(message);
    setEditContent(message.content);
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage || !editContent.trim()) return;

    try {
      const res = await fetch(`/api/messages/${editingMessage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to update message');
      }

      setEditingMessage(null);
      setEditContent('');
      await fetchMessages(); // Refresh messages after updating
    } catch (e) {
      console.error('Error updating message:', e);
      setError(e instanceof Error ? e.message : 'Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete message');
    }

      await fetchMessages(); // Refresh messages after deleting
    } catch (e) {
      console.error('Error deleting message:', e);
      setError(e instanceof Error ? e.message : 'Failed to delete message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Conversation List */}
        <div className="w-full md:w-1/3">
          <h2 className="text-xl font-bold mb-4">Conversations</h2>
        {loading ? (
            <div className="text-gray-500">Loading conversations...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="text-gray-500">No conversations yet.</div>
          ) : (
            <ul>
              {conversations.map((conv, idx) => (
                <li
                  key={idx}
                  className={`p-4 mb-2 rounded cursor-pointer ${
                    selected === idx ? "bg-blue-100" : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => setSelected(idx)}
                >
                  <div className="font-semibold">{conv.propertyTitle}</div>
                  <div className="text-sm text-gray-500">with {conv.otherUser.name}</div>
                </li>
              ))}
            </ul>
          )}
          </div>

        {/* Messages */}
        <div className="w-full md:w-2/3">
          {selected === null ? (
            <div className="text-gray-500">Select a conversation to view messages.</div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 max-h-[400px] border rounded p-4 bg-white">
                {conversations[selected].messages
                  .slice()
                  .reverse()
                  .map((msg) => (
                    <div key={msg.id} className="mb-4 group relative">
                      <div
                        className={`text-sm ${
                          msg.sender.id === session?.user?.id
                            ? "text-blue-600"
                            : "text-gray-900"
                        }`}
                      >
                        <span className="font-semibold">{msg.sender.name}</span>:
                        <span className="ml-2">{msg.content}</span>
                      </div>
                      <div className="text-xs text-gray-400 ml-2">
                        {new Date(msg.createdAt).toLocaleString()}
                          </div>
                      {/* Message Actions */}
                      <div className="absolute right-0 top-0 hidden group-hover:flex gap-2">
                        {msg.sender.id === session?.user?.id && (
                          <button
                            onClick={() => handleEditMessage(msg)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                        </div>

              {/* Edit Message Modal */}
              {editingMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Edit Message
                    </h3>
                    <form onSubmit={handleUpdateMessage}>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        required
                      />
                      <div className="mt-4 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessage(null);
                            setEditContent('');
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          Update
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={sending || !reply.trim()}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
              {error && (
                <div className="text-red-500 mt-2">{error}</div>
              )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
} 