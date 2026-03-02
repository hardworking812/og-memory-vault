"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface MediaType {
  _id: string;
  fileUrl: string;
  publicId?: string;
  fileType: string;
}

export default function EventPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [media, setMedia] = useState<MediaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch Media
  useEffect(() => {
    if (!eventId) return;

    fetch(`http://localhost:5000/api/media/event/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setMedia(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching media:", err);
        setLoading(false);
      });
  }, [eventId]);

  // Upload Handler
  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `http://localhost:5000/api/media/upload/${eventId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMedia((prev) => [data.media, ...prev]);
      }

      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  // Delete Handler
  const handleDelete = async (mediaId: string) => {
    try {
      await fetch(
        `http://localhost:5000/api/media/delete/${mediaId}`,
        { method: "DELETE" }
      );

      setMedia((prev) =>
        prev.filter((item) => item._id !== mediaId)
      );
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-10">

      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-10">
        Event Gallery
      </h1>

      {/* Upload Button */}
      <div className="flex justify-center mb-10">
        <label className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl cursor-pointer hover:bg-white/20 transition">
          {uploading ? "Uploading..." : "Upload Memory"}
          <input
            type="file"
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleUpload(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      {/* Loading State */}
      {loading && (
        <p className="text-center text-gray-400">Loading memories...</p>
      )}

      {/* Gallery Grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {media.map((item) => (
            <div
                key={item._id}
                className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
                >
                {/* Delete Button */}
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                    }}
                    className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                >
                    Delete
                </button>

                {item.fileType === "image" ? (
                    <img
                    src={item.fileUrl}
                    alt="memory"
                    className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setSelectedImage(item.fileUrl)}
                    />
                ) : (
                    <video
                    src={item.fileUrl}
                    controls
                    className="w-full h-72"
                    />
                )}
            </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="fullscreen"
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </main>
  );
}