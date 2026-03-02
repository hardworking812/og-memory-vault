"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [events, setEvents] = useState<EventType[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth");
      return;
    }

    fetch(`${API}/api/events/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setEvents);

    fetch(`${API}/api/admin/storage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setStorage);
  }, [mounted]);

  if (!mounted) return null;

  const handleSaveEvent = async () => {
    if (!title || !date) return;

    const token = localStorage.getItem("token");

    const url = editingEvent
      ? `${API}/api/events/update/${editingEvent._id}`
      : `${API}/api/events/create`;

    const method = editingEvent ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, date }),
    });

    if (response.ok) {
      setShowModal(false);
      setEditingEvent(null);
      setTitle("");
      setDescription("");
      setDate("");
      window.location.reload();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const token = localStorage.getItem("token");

    if (!confirm("Delete this event and all memories?")) return;

    await fetch(`${API}/api/events/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setEvents(events.filter((event) => event._id !== id));
  };

  const usedGB = storage
    ? (storage.used / 1024 / 1024 / 1024).toFixed(2)
    : "0";

  const limitGB = storage
    ? (storage.limit / 1024 / 1024 / 1024).toFixed(0)
    : "25";

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-bold">OG's Memories Vault</h1>
          {storage && (
            <p className="text-gray-400 mt-2">
              Storage: {usedGB} GB / {limitGB} GB
            </p>
          )}
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.replace("/auth");
          }}
          className="bg-white text-black px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Create Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowModal(true);
          }}
          className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl hover:bg-white/20 transition"
        >
          Create Memory Event
        </button>
      </div>

      {/* Event Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div
            key={event._id}
            className="relative bg-white/10 p-6 rounded-3xl hover:scale-105 transition"
          >
            {/* Edit */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingEvent(event);
                setTitle(event.title);
                setDescription(event.description);
                setDate(event.date.split("T")[0]);
                setShowModal(true);
              }}
              className="absolute top-3 left-3 bg-blue-600 px-3 py-1 rounded-lg"
            >
              Edit
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDeleteEvent(event._id)}
              className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded-lg"
            >
              Delete
            </button>

            <Link href={`/event/${event._id}`}>
              <div className="cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2">
                  {event.title}
                </h2>

                <p className="text-gray-400 text-sm mb-2">
                  {new Date(event.date).toDateString()}
                </p>

                <p className="text-gray-300 text-sm">
                  {event.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-2xl w-96 space-y-4">
            <h2 className="text-xl font-semibold">
              {editingEvent ? "Edit Event" : "Create Event"}
            </h2>

            <input
              type="text"
              placeholder="Event Title"
              className="w-full p-2 bg-black border border-gray-700 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="date"
              className="w-full p-2 bg-black border border-gray-700 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <textarea
              placeholder="Description"
              className="w-full p-2 bg-black border border-gray-700 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEvent}
                className="bg-white/20 px-4 py-2 rounded"
              >
                {editingEvent ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}