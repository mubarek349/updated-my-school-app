import { useParams } from "next/navigation";
import Player from "./stream/Player";

// interface VideoListProps {
//   refresh: boolean;
// }
export default function CourseTopOverview({
  title,
  by,
  thumbnail,
  video,
}: {
  title: string;
  by: string;
  thumbnail: string;
  video: string;
}) {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang || "en";
  console.log("CourseTopOverview video:", video);
  return (
    <div className="flex gap-y-4 max-md:flex-col-reverse flex-col">
      <div className="flex gap-4 flex-col">
        <p className="text-xl md:text-3xl font-extrabold break-words">
          {title}
        </p>
        <div className="w-fit flex gap-2 items-center">
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt=""
              className="size-10 object-cover rounded-full"
            />
          }
          <div className="">
            <p className="">{lang == "en" ? "course by" : "ኮርስ "}</p>
            <p className="font-bold">
              {lang == "en" ? "" : "በ"}
              {by}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-md md:rounded-xl overflow-hidden">
        {video && <Player src={video} type="local" />}
      </div>
    </div>
  );
}
