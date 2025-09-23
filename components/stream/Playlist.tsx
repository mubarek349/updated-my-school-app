// Next / Prev video playlist
import React from "react";
import Image from "next/image";

interface Video {
  id: string;
  title: string;
  thumbnail?: string;
}

interface PlaylistProps {
  videos: Video[];
  currentVideoId: string;
  onSelect: (id: string) => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  videos,
  currentVideoId,
  onSelect,
}) => {
  const currentIndex = videos.findIndex((v) => v.id === currentVideoId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelect(videos[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      onSelect(videos[currentIndex + 1].id);
    }
  };

  return (
    <div className="playlist">
      <button onClick={handlePrev} disabled={currentIndex <= 0}>
        Prev
      </button>
      <ul>
        {videos.map((video) => (
          <li
            key={video.id}
            className={video.id === currentVideoId ? "active" : ""}
            onClick={() => onSelect(video.id)}
            style={{
              cursor: "pointer",
              fontWeight: video.id === currentVideoId ? "bold" : "normal",
            }}
          >
            <Image
              src={video?.thumbnail? video.thumbnail : "/images/placeholder.png"}
              alt={video.title}
              width={60}
              height={34}
              style={{ marginRight: 8 }}
            />
            {video.title}
          </li>
        ))}
      </ul>
      <button onClick={handleNext} disabled={currentIndex >= videos.length - 1}>
        Next
      </button>
    </div>
  );
};

export default Playlist;
