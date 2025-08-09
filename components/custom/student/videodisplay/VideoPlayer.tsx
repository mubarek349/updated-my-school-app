interface VideoPlayerProps {
  videoId?: string;
}

export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  if (!videoId) return null;

  return (
    <iframe
      className="w-full aspect-video mx-auto max-md:sticky top-0 z-50 rounded-lg shadow-lg"
      src={`https://www.youtube.com/embed/${videoId}`}
      title="Darulkubra video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      aria-label="Chapter video player"
    />
  );
};
