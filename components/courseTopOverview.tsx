import Player from "./stream/Player";

export default function CourseTopOverview({ video }: { video: string }) {

  console.log("CourseTopOverview video:", video);
  return (
    <div className="flex gap-y-4 max-md:flex-col-reverse flex-col overflow-hidden">
      <div className="overflow-hidden">
        {video && <Player src={video} type="local" />}
      </div>
    </div>
  );
}
