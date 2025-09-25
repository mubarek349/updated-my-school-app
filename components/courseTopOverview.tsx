import { useParams } from "next/navigation";
import Player from "./stream/Player";

// interface VideoListProps {
//   refresh: boolean;
// }
export default function CourseTopOverview({ video }: { video: string }) {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang || "en";
  console.log("CourseTopOverview video:", video);
  return (
    <div className="flex gap-y-4 max-md:flex-col-reverse flex-col">
      <div className="rounded-md md:rounded-xl overflow-hidden">
        {video && <Player src={video} type="local" />}
      </div>
    </div>
  );
}
