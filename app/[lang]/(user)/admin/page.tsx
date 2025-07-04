import { auth } from "@/lib/auth";
// import { isTeacher } from "@/lib/teacher";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  console.log("AUTH", auth);
  redirect("/en/admin/coursesPackages");
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text Content - Left side on desktop, top on mobile */}
          <div className="md:w-1/2 md:pr-12 text-center md:text-left mb-12 md:mb-0">
            <div className="mb-8">
              <BookOpen className="w-12 h-12 text-emerald-600 mx-auto md:mx-0" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Advance your Quranic skills with us
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              We are Darulkubra Online Quran Center
            </p>
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-orange-700 transition">
              contact the admin
            </button>
          </div>

          {/* Image - Right side on desktop, below text on mobile */}
          <div className="md:w-1/2 md:pl-12">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              {/* Replace with your actual image path */}
              <Image
                src="/quran.jpg" // Update this path
                alt="Quran Learning"
                layout="fill"
                objectFit="cover"
                className="transition-opacity duration-300 hover:opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
