"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface MediaType {
  _id: string;
  fileUrl: string;
  fileType: string;
}

export default function EventPage() {
  const { id } = useParams();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [media, setMedia] = useState<MediaType[]>([]);
  const [mounted, setMounted] = useState(false);

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

    fetch(`${API}/api/media/event/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setMedia(data))
      .catch((err) => console.error(err));
  }, [mounted, id]);

  if (!mounted) return null;

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${API}/api/media/upload/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    window.location.reload();
  };

  const handleDelete = async (mediaId: string) => {
    const token = localStorage.getItem("token");

    await fetch(`${API}/api/media/delete/${mediaId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMedia((prev) => prev.filter((m) => m._id !== mediaId));
  };

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <button
        onClick={() => router.push("/")}
        className="mb-6 bg-white text-black px-4 py-2 rounded"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Event Gallery</h1>

      <input
        type="file"
        onChange={handleUpload}
        className="mb-8"
      />

      <div className="grid md:grid-cols-3 gap-6">
        {media.map((item) => (
          <div key={item._id} className="relative">
            {item.fileType === "image" ? (
              <img
                src={item.fileUrl}
                className="rounded-xl"
              />
            ) : (
              <video
                src={item.fileUrl}
                controls
                className="rounded-xl"
              />
            )}

            <button
              onClick={() => handleDelete(item._id)}
              className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}