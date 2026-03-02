"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Event {
  _id: string;
  title: string;
  date: string;
  description: string;
}

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // 🔐 Protect Route
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
    } else {
      fetchEvents();
    }
  }, []);

  // 📦 Fetch Events
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API}/api/events`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        router.push("/auth");
        return;
      }

      const data = await res.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading Vault...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">OG Memory Vault</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Logout
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            onClick={() => router.push(`/event/${event._id}`)}
            className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700 hover:border-white transition cursor-pointer shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <p className="text-gray-400 mb-2">
              {new Date(event.date).toDateString()}
            </p>
            <p className="text-gray-300">{event.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}