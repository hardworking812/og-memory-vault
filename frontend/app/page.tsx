"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
}

export default function Home() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  // Fetch Events
  const fetchEvents = () => {
    fetch("http://localhost:5000/api/events/all")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Create Event
  const handleCreateEvent = async () => {
    if (!title || !date) return;

    const response = await fetch(
      "http://localhost:5000/api/events/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date }),
      }
    );

    if (response.ok) {
      setShowModal(false);
      setTitle("");
      setDescription("");
      setDate("");
      fetchEvents();
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    const confirmDelete = window.confirm(
      "This will delete the event and ALL its memories. Are you sure?"
    );

    if (!confirmDelete) return;

    await fetch(
      `http://localhost:5000/api/events/delete/${eventId}`,
      { method: "DELETE" }
    );

    setEvents((prev) =>
      prev.filter((event) => event._id !== eventId)
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-10">

      {/* Title */}
      <h1 className="text-5xl font-bold text-center mb-12">
        OG Memory Vault
      </h1>

      {/* Create Event Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => setShowModal(true)}
          className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl hover:bg-white/20 transition"
        >
          Create New Memory Event
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-400">Loading memories...</p>
      )}

      {/* Event Grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div
            key={event._id}
            className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-3xl shadow-xl hover:scale-105 transition-all duration-300"
          >
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent(event._id);
              }}
              className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg"
            >
              Delete
            </button>

            <Link href={`/event/${event._id}`}>
              <div className="cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2">
                  {event.title}
                </h2>

                <p className="text-gray-400 text-sm mb-4">
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

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl w-96 space-y-4">
            <h2 className="text-xl font-semibold">
              Create New Event
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
                onClick={handleCreateEvent}
                className="bg-white/20 px-4 py-2 rounded hover:bg-white/30"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}