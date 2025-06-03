
// "use client";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import { course } from "@prisma/client";
// import axios from "axios";
// import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";


// interface ImageFormProps {
//   initialData: course;
//   courseId: string;
//   coursesPackageId:string;
// }

// const formSchema = z.object({
//   imageUrl: z.string().min(1, { message: "Image is required" }),
// });

// export const ImageForm = ({ initialData, courseId,coursesPackageId }: ImageFormProps) => {
//   const [isEditing, setIsEditing] = useState(false);

//   const router = useRouter();

//   const toggleEdit = () => setIsEditing((prev) => !prev);


// useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: { imageUrl:initialData?.imageUrl ||"" },
//   });
//   // const { isSubmitting, isValid } = form.formState;

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       await axios.patch(
//         `/api/coursesPackages/${coursesPackageId}/courses/${courseId}`,
//         values
//       );
//       toast.success("Course Updated");
//         toggleEdit();
//       router.refresh();
//     } catch (error) {
//       console.error("Update Error:", error);
//       toast.error("Something went wrong.");
//     }
//   };

//   return (
//     <div className="mt-6 border bg-slate-100 rounded-md p-4">
//       <div className="font-medium flex items-center justify-between">
//         Course Image
//         <Button onClick={toggleEdit} variant="ghost">
//           {isEditing && <>Cancel</>}

//           {!isEditing && !initialData.imageUrl && (
//             <>
//               <PlusCircle className="w-4 h-4 mr-2" />
//               Add an image
//             </>
//           )}

//           {!isEditing && initialData.imageUrl && (
//             <>
//               <Pencil className="w-4 h-4 mr-2" /> Edit Image
//             </>
//           )}
//         </Button>
//       </div>

//       {!isEditing &&
//         (!initialData.imageUrl ? (
//           <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
//             <ImageIcon className="w-10 h-10 text-slate-500" />
//           </div>
//         ) : (
//           <div className="relative aspect-video mt-2">
//             <Image
//               alt="Upload"
//               fill
//               className="object-cover rounded-md"
//               src={initialData.imageUrl}
//             />
//           </div>
//         ))}

//       {isEditing && (
//         <div className="border-3 border-red-500">
          
//           <div className="text-xs text-muted-foreground mt-4">
//             16:9 aspect ratio recommended
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// "use client";
// import * as z from "zod";
// import { FileUpload } from "@/components/file-upload";
// import { Button } from "@/components/ui/button";
// import { course } from "@prisma/client";
// import axios from "axios";
// import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";


// interface ImageFormProps {
//   initialData: course;
//   courseId: string;
//   coursesPackageId:string;
// }

// const formSchema = z.object({
//   imageUrl: z.string().min(1, { message: "Image is required" }),
// });

// export const ImageForm = ({ initialData, courseId,coursesPackageId }: ImageFormProps) => {
//   const [isEditing, setIsEditing] = useState(false);

//   const router = useRouter();

//   const toggleEdit = () => setIsEditing((prev) => !prev);


// useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: { imageUrl:initialData?.imageUrl ||"" },
//   });
//   // const { isSubmitting, isValid } = form.formState;

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       await axios.patch(
//         `/api/coursesPackages/${coursesPackageId}/courses/${courseId}`,
//         values
//       );
//       toast.success("Course Updated");
//         toggleEdit();
//       router.refresh();
//     } catch (error) {
//       console.error("Update Error:", error);
//       toast.error("Something went wrong.");
//     }
//   };

//   return (
//     <div className="mt-6 border bg-slate-100 rounded-md p-4">
//       <div className="font-medium flex items-center justify-between">
//         Course Image
//         <Button onClick={toggleEdit} variant="ghost">
//           {isEditing && <>Cancel</>}

//           {!isEditing && !initialData.imageUrl && (
//             <>
//               <PlusCircle className="w-4 h-4 mr-2" />
//               Add an image
//             </>
//           )}

//           {!isEditing && initialData.imageUrl && (
//             <>
//               <Pencil className="w-4 h-4 mr-2" /> Edit Image
//             </>
//           )}
//         </Button>
//       </div>

//       {!isEditing &&
//         (!initialData.imageUrl ? (
//           <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
//             <ImageIcon className="w-10 h-10 text-slate-500" />
//           </div>
//         ) : (
//           <div className="relative aspect-video mt-2">
//             <Image
//               alt="Upload"
//               fill
//               className="object-cover rounded-md"
//               src={initialData.imageUrl}
//             />
//           </div>
//         ))}

//       {isEditing && (
//         <div className="border-3 border-red-500">
//           <FileUpload 
//             endpoint="courseImage"
//             onChange={(url) => {
//               if (url) {
//                 onSubmit({ imageUrl: url });
//               }
//             }}
//           />
//           <div className="text-xs text-muted-foreground mt-4">
//             16:9 aspect ratio recommended
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

