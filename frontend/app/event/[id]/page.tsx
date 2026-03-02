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
  const [selected, setSelected] = useState<MediaType | null>(null);
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      .catch(console.error);
  }, [mounted, id]);

  if (!mounted) return null;

  /* ===========================
     MULTIPLE FILE UPLOAD
  ============================ */
  const handleUpload = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const token = localStorage.getItem("token");

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      try {
        const res = await fetch(`${API}/api/media/upload/${id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (data.media) {
          setMedia((prev) => [data.media, ...prev]);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setUploading(false);
    e.target.value = ""; // reset input
  };

  /* ===========================
     DELETE MEDIA
  ============================ */
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

  /* ===========================
     DOWNLOAD MEDIA
  ============================ */
  const handleDownload = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "memory";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 py-12">

      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <button
          onClick={() => router.push("/")}
          className="bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-xl border border-white/20"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">Event Gallery</h1>

        <div />
      </div>

      {/* Upload Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-3xl p-10 cursor-pointer hover:bg-white/5 transition backdrop-blur-lg">
          <span className="text-lg mb-2">
            {uploading ? "Uploading..." : "Upload Memories"}
          </span>
          <span className="text-sm text-gray-400">
            Click to select multiple images or videos
          </span>

          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Media Grid */}
      <div className="max-w-6xl mx-auto grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {media.map((item) => (
          <div
            key={item._id}
            onClick={() => setSelected(item)}
            className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition duration-300"
          >
            {item.fileType === "image" ? (
              <img
                src={item.fileUrl.replace("/upload/", "/upload/f_auto,q_auto/")}
                className="w-full h-72 object-cover"
              />
            ) : (
              <video
                src={item.fileUrl}
                className="w-full h-72 object-cover"
              />
            )}

            {/* Download */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(item.fileUrl);
              }}
              className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition bg-white/20 px-3 py-1 rounded-lg text-sm"
            >
              Download
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item._id);
              }}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition bg-red-600 px-3 py-1 rounded-lg text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-5xl w-full px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex gap-4">
              <button
                onClick={() => handleDownload(selected.fileUrl)}
                className="bg-white/20 px-4 py-2 rounded-xl text-sm hover:bg-white/30 transition"
              >
                Download
              </button>

              <button
                onClick={() => setSelected(null)}
                className="text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {selected.fileType === "image" ? (
              <img
                src={selected.fileUrl.replace("/upload/", "/upload/f_auto,q_auto/")}
                className="w-full max-h-[90vh] object-contain rounded-2xl"
              />
            ) : (
              <video
                src={selected.fileUrl}
                controls
                autoPlay
                className="w-full max-h-[90vh] rounded-2xl"
              />
            )}
          </div>
        </div>
      )}

    </main>
  );
}