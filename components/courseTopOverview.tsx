import Player from "./stream/Player";

export default function CourseTopOverview({ video }: { video: string }) {

  console.log("CourseTopOverview video:", video);
  return (
    <div className="aspect-video lg:w-3xl bg-black flex gap-y-4 max-md:flex-col-reverse flex-col overflow-hidden">
        {video && <Player src={video} type="local" />}
    </div>
  );
}
