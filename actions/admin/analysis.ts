"use server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { getActivePackageProgress } from "@/actions/student/progress";
import { progress } from "framer-motion";

export async function getStudentProgressStatus(
  studentId: number,
  activePackageId: string
) {
  // 1. Get all chapters for the active package
  const chapters = await prisma.chapter.findMany({
    where: { course: { packageId: activePackageId } },
    select: {
      id: true,
      title: true,
      course: { select: { title: true, package: { select: { name: true } } } },
    },
  });
  const chapterIds = chapters.map((ch) => ch.id);

  const progress = await prisma.studentProgress.findMany({
    where: {
      studentId,
      chapterId: { in: chapterIds },
    },
    select: { isCompleted: true, chapterId: true },
  });

  if (progress.length > 0) {
    if (progress.filter((p) => p.isCompleted).length === chapterIds.length) {
      return "completed";
    } else {
      const firstIncomplete = progress.find((p) => !p.isCompleted);
      // Find the chapter details for that id
      const chapter = chapters.find(
        (ch) => ch.id === firstIncomplete?.chapterId
      );
      const chapterTitle = chapter?.title ?? null;
      const courseTitle = chapter?.course?.title ?? null;
      const packageName = chapter?.course?.package?.name ?? null;

      const percent = getProgressPercent(progress, chapterIds.length);
      // if (percent <= 10) return `<=10% ${packageName} > ${courseTitle} > ${chapterTitle}`;
      // else if (percent <= 40) return `<=40% ${packageName} > ${courseTitle} > ${chapterTitle}`;
      // else if (percent <= 70) return `<=70% ${packageName} > ${courseTitle} > ${chapterTitle}`;
      // else return `<100% ${packageName} > ${courseTitle} > ${chapterTitle}`;
      return `${packageName} > ${courseTitle} > ${chapterTitle} -> ${percent}%`;
    }
  } else {
    return "notstarted";
  }

  // 2. Get all progress records for this student and these chapters
  // const progress = await prisma.studentProgress.findMany({
  //   where: {
  //     studentId,
  //     chapterId: { in: chapterIds },
  //   },
  //   select: { isCompleted: true, chapterId: true },
  // });

  // 3. Logic
  //   if (chapterIds.length === 0 || progress.length === 0) {
  //     return "notstarted";
  //   }
  //   if (progress.some((p) => !p.isCompleted)) {
  //     // Find the first incomplete chapter's id
  //     const firstIncomplete = progress.find((p) => !p.isCompleted);
  //     // Find the chapter details for that id
  //     const chapter = chapters.find((ch) => ch.id === firstIncomplete?.chapterId);
  //     const chapterTitle = chapter?.title ?? null;
  //     const courseTitle = chapter?.course?.title ?? null;
  //     const packageName = chapter?.course?.package?.name ?? null;
  //     return `${packageName} > ${courseTitle} > ${chapterTitle}`;
  //   }
  //   return "completed";
  // }
}
export async function filterStudentsByPackageandStatus(
  packageId: string,
  status: string
) {
  console.log(
    "Filtering students for package:",
    packageId,
    "with status:",
    status
  );
  // 1. Get all chapters for the package
  const chapters = await prisma.chapter.findMany({
    where: { course: { packageId } },
    select: { id: true },
  });
  const chapterIds = chapters.map((ch) => ch.id);

  // 2. Get all students assigned to this package
  const subjectPackages = await prisma.subjectPackage.findMany({
    where: { packageId },
    select: {
      subject: true,
      packageType: true,
      kidpackage: true,
    },
    distinct: ["subject", "kidpackage", "packageType"],
  });

  const students = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackages.map((sp) => ({
        subject: sp.subject,
        package: sp.packageType,
        isKid: sp.kidpackage,
      })),
    },
    select: {
      wdt_ID: true,
      chat_id: true,
    },
  });

  // 3. For each student, check their progress for the chapters in the package
  let filteredChatIds: string[] = [];

  for (const student of students) {
    // Get all progress records for this student and these chapters
    const progress = await prisma.studentProgress.findMany({
      where: {
        studentId: student.wdt_ID,
        chapterId: { in: chapterIds },
      },
      select: { isCompleted: true, chapterId: true },
    });

    if (!student.chat_id) continue;

    // if thhe pass data is packageid and not start  then return the chat_id of student not start,if t=pass complete then return the chatid of student completed and if onprogress then return the chatid of student in progress
    if (progress.length === 0) {
      if (status === "notstarted") {
        filteredChatIds.push(student.chat_id);
      }
    } else if (
      progress.filter((p) => p.isCompleted).length === chapterIds.length
    ) {
      if (status === "completed") {
        filteredChatIds.push(student.chat_id);
      }
    } else {
      const percent = getProgressPercent(progress, chapterIds.length);
      if (status === "inprogress_0" && percent == 0) {
        filteredChatIds.push(student.chat_id);
      } else if (status === "inprogress_10" && percent <= 10) {
        filteredChatIds.push(student.chat_id);
      } else if (status === "inprogress_40" && percent > 10 && percent <= 40) {
        filteredChatIds.push(student.chat_id);
      } else if (status === "inprogress_70" && percent > 40 && percent <= 70) {
        filteredChatIds.push(student.chat_id);
      } else if (status === "inprogress_o" && percent > 70) {
        filteredChatIds.push(student.chat_id);
      }
    }
  }

  //   let studentStatus: "completed" | "not-started" | "in-progress" = "not-started";
  //   if (chapterIds.length === 0 || progress.length === 0) {
  //     studentStatus = "not-started";
  //   } else if (progress.every((p) => p.isCompleted)) {
  //     studentStatus = "completed";
  //   } else if (progress.some((p) => !p.isCompleted)) {
  //     studentStatus = "in-progress";
  //   }

  //   if (studentStatus === status && student.chat_id) {
  //     filteredChatIds.push(student.chat_id);
  //   }
  // }

  console.log("Filtered chat IDs:", filteredChatIds);

  return filteredChatIds;
}

function getProgressPercent(
  progress: { isCompleted: boolean }[],
  total: number
): number {
  if (progress.length === 0) return 0;
  const completed = progress.filter((p) => p.isCompleted).length;
  return Number((completed / total) * 100);
}
export async function filterStudentsByPackageList(packageId: string) {
  console.log("Filtering students for package:", packageId);

  // 1. Get all chapters for the package
  const chapters = await prisma.chapter.findMany({
    where: { course: { packageId } },
    select: { id: true },
  });
  const chapterIds = chapters.map((ch) => ch.id);

  // 2. Get all students assigned to this package
  const subjectPackages = await prisma.subjectPackage.findMany({
    where: { packageId },
    select: {
      subject: true,
      packageType: true,
      kidpackage: true,
    },
    distinct: ["subject", "kidpackage", "packageType"],
  });

  const students = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackages.map((sp) => ({
        subject: sp.subject,
        package: sp.packageType,
        isKid: sp.kidpackage,
      })),
    },
    select: {
      wdt_ID: true,
      chat_id: true,
    },
  });

  // 3. For each student, check their progress for the chapters in the package
  let notStartedChatIds: string[] = [];
  let completedChatIds: string[] = [];
  let inProgress0ChatIds: string[] = [];
  let inProgress10ChatIds: string[] = [];
  let inProgress40ChatIds: string[] = [];
  let inProgress70ChatIds: string[] = [];
  let inProgressOtherChatIds: string[] = [];
  for (const student of students) {
    // Get all progress records for this student and these chapters
    const progress = await prisma.studentProgress.findMany({
      where: {
        studentId: student.wdt_ID,
        chapterId: { in: chapterIds },
      },
      select: { isCompleted: true, chapterId: true },
    });

    if (progress.length > 0) {
      if (progress.filter((p) => p.isCompleted).length === chapterIds.length) {
        completedChatIds.push(student.wdt_ID + "");
      } else {
        const percent = getProgressPercent(progress, chapterIds.length);
        if (percent == 0) inProgress0ChatIds.push(student.wdt_ID + "");
        else if (percent <= 10) inProgress10ChatIds.push(student.wdt_ID + "");
        else if (percent <= 40) inProgress40ChatIds.push(student.wdt_ID + "");
        else if (percent <= 70) inProgress70ChatIds.push(student.wdt_ID + "");
        else inProgressOtherChatIds.push(student.wdt_ID + "");
      }
    } else {
      notStartedChatIds.push(student.wdt_ID.toString());
    }
  }

  // Assign to one object and return
  const result = [
    { status: "notstarted", count: notStartedChatIds.length },
    { status: "inprogress_0", count: inProgress0ChatIds.length },
    { status: "inprogress_10", count: inProgress10ChatIds.length },
    { status: "inprogress_40", count: inProgress40ChatIds.length },
    { status: "inprogress_70", count: inProgress70ChatIds.length },
    { status: "inprogress_o", count: inProgressOtherChatIds.length },
    { status: "completed", count: completedChatIds.length },
    // { status: "total", count: students.length },
  ];

  return result;

  //   let studentStatus: "completed" | "not-started" | "in-progress" = "not-started";
  //   if (chapterIds.length === 0 || progress.length === 0) {
  //     studentStatus = "not-started";
  //   } else if (progress.every((p) => p.isCompleted)) {
  //     studentStatus = "completed";
  //   } else if (progress.some((p) => !p.isCompleted)) {
  //     studentStatus = "in-progress";
  //   }

  //   if (studentStatus === status && student.chat_id) {
  //     filteredChatIds.push(student.chat_id);
  //   }
  // }

  // console.log("Filtered chat IDs:", filteredChatIds);

  // return filteredChatIds;
}
export async function getAllStudents() {
  const students = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      status: { in: ["Active", "Not yet"] },
    },
    select: {
      wdt_ID: true,
      name: true,
      phoneno: true,
      isKid: true,
      youtubeSubject: true,
    },
  });

  // const progress = await prisma.studentProgress.findFirst({
  //   where:{
  //     studentId: students[0].wdt_ID, // Assuming you want progress for the first student
  //     chapter: { course: { packageId: students[0].youtubeSubject ?? undefined } }
  //   },
  //   select:{
  //     chapter: {
  //       select: {
  //         title: true,
  //         course: {
  //           select: {
  //             title: true,
  //             package: { select: { name: true } },
  //           },
  //         },
  //       },
  //     },
  //   }
  // })
  // For each student, get their progress data
  const studentsWithProgress = await Promise.all(
    students.map(async (student) => {
      const progressData = await getActivePackageProgress(student.wdt_ID);
      const progressStatus = await getStudentProgressStatus(
        student.wdt_ID,
        student.youtubeSubject ?? ""
      );

      return {
        ...student,
        progressStatus, // attach the progress status here
        progressData, // attach the progress data here
      };
    })
  );
  return studentsWithProgress;
}
export async function getAllAssignedCoursePackages() {
  const uniquePackages = await prisma.subjectPackage.findMany({
    distinct: ["packageId"],
    select: {
      packageId: true,
    },
  });

  return uniquePackages.length;
}

export async function getTotalStudentsThatHaveacessthePacakges() {
  const subjectPackages = await prisma.subjectPackage.findMany({
    select: {
      subject: true,
      kidpackage: true,
      packageType: true,
      package: { select: { name: true } },
    },
    distinct: ["subject", "kidpackage", "packageType"],
  });

  // For each group, count matching students and return multidimensional array
  const result = subjectPackages.map((sp) => {
    const packageName = sp.package?.name || "Unknown Package";
    return {
      packageName,
      subject: sp.subject,
      kidpackage: sp.kidpackage,
      packageType: sp.packageType,
    };
  });

  // Now, group by packageName and count total students for each package
  const packageStats: Record<
    string,
    { packageName: string; totalStudents: number }
  > = {};
  let totalStudents = 0;
  await Promise.all(
    subjectPackages.map(async (sp) => {
      const packageName = sp.package?.name || "Unknown Package";
      const studentsCount = await prisma.wpos_wpdatatable_23.count({
        where: {
          status: { in: ["Active", "Not yet"] },
          subject: sp.subject,
          package: sp.packageType,
          isKid: sp.kidpackage ?? undefined,
        },
      });
      if (!packageStats[packageName]) {
        packageStats[packageName] = { packageName, totalStudents: 0 };
      }
      packageStats[packageName].totalStudents += studentsCount;
      totalStudents += studentsCount;
    })
  );

  return totalStudents;
  // Convert to multidimensional array
  const multidimensionalArray = Object.values(packageStats);
}
export async function getThePackagesWhichHasLargestStudent() {
  // Get all unique combinations of subject, kidpackage, and packageType from subjectPackage
  const subjectPackages = await prisma.subjectPackage.findMany({
    select: {
      subject: true,
      kidpackage: true,
      packageType: true,
      package: { select: { name: true } },
    },
    distinct: ["subject", "kidpackage", "packageType"],
  });

  // Group by packageName and count total students for each package
  const packageStats: Record<
    string,
    { packageName: string; totalStudents: number }
  > = {};

  await Promise.all(
    subjectPackages.map(async (sp) => {
      const packageName = sp.package?.name || "Unknown Package";
      const studentsCount = await prisma.wpos_wpdatatable_23.count({
        where: {
          status: { in: ["Active", "Not yet"] },
          subject: sp.subject,
          package: sp.packageType,
          isKid: sp.kidpackage ?? undefined,
        },
      });
      if (!packageStats[packageName]) {
        packageStats[packageName] = { packageName, totalStudents: 0 };
      }
      packageStats[packageName].totalStudents += studentsCount;
    })
  );

  // Find the package(s) with the largest student count
  const maxCount = Math.max(
    ...Object.values(packageStats).map((p) => p.totalStudents)
  );
  const largestPackages = Object.values(packageStats).filter(
    (p) => p.totalStudents === maxCount
  );

  return largestPackages;
}
// Get all unique combinations of subject, packageType, and kidpackage from subjectPackage
export async function getStudentsGroupedBySubjectKidType() {
  // Get all unique combinations of subject, kidpackage, and packageType from subjectPackage
  const subjectPackages = await prisma.subjectPackage.findMany({
    select: {
      subject: true,
      kidpackage: true,
      packageType: true,
      package: { select: { name: true } },
    },
    distinct: ["subject", "kidpackage", "packageType"],
  });

  // For each group, count matching students and return multidimensional array
  const result = subjectPackages.map((sp) => {
    const packageName = sp.package?.name || "Unknown Package";
    return {
      packageName,
      subject: sp.subject,
      kidpackage: sp.kidpackage,
      packageType: sp.packageType,
    };
  });

  // Now, group by packageName and count total students for each package
  const packageStats: Record<
    string,
    { packageName: string; totalStudents: number }
  > = {};

  await Promise.all(
    subjectPackages.map(async (sp) => {
      const packageName = sp.package?.name || "Unknown Package";
      const studentsCount = await prisma.wpos_wpdatatable_23.count({
        where: {
          status: { in: ["Active", "Not yet"] },
          subject: sp.subject,
          package: sp.packageType,
          isKid: sp.kidpackage ?? undefined,
        },
      });
      if (!packageStats[packageName]) {
        packageStats[packageName] = { packageName, totalStudents: 0 };
      }
      packageStats[packageName].totalStudents += studentsCount;
    })
  );

  // Convert to multidimensional array
  const multidimensionalArray = Object.values(packageStats);

  return multidimensionalArray;
}

export async function getPackageAnalytics() {
  // 1. Get all course packages
  const packages = await prisma.coursePackage.findMany({
    select: {
      id: true,
      name: true,
      subjectPackages: {
        select: {
          subject: true,
          packageType: true,
          kidpackage: true,
        },
      },
    },
  });

  // 2. For each package, gather analytics
  const analytics = await Promise.all(
    packages.map(async (pkg) => {
      // Get all students assigned to this package via subjectPackage
      const subjectPackages = pkg.subjectPackages;
      // Find all students matching any subjectPackage for this package
      const assignedStudents = await prisma.wpos_wpdatatable_23.findMany({
        where: {
          status: { in: ["Active", "Not yet"] },
          OR: subjectPackages.map((sp) => ({
            subject: sp.subject ?? undefined,
            package: sp.packageType ?? undefined,
            isKid: sp.kidpackage ?? undefined,
          })),
        },
        select: {
          wdt_ID: true,
          name: true,
          youtubeSubject: true,
          progress: true,
        },
      });

      // total Students assigned to this package
      const assignedTotalStudents = assignedStudents.length;

      // // Not started: youtubeSubject is null
      // const notStartedStudents = assignedStudents.filter(
      //   (s) => !s.progress || s.youtubeSubject === null
      // );

      const completedStudents: typeof assignedStudents = [];
      const inProgressStudents: typeof assignedStudents = [];
      const notStartedStudents: typeof assignedStudents = [];

      for (const student of assignedStudents) {
        // Get all chapters in the package
        const allChapters = await prisma.course.findMany({
          where: { packageId: pkg.id },
          select: { chapters: { select: { id: true } } },
        });
        const chapterIds = allChapters.flatMap((c) =>
          c.chapters.map((ch) => ch.id)
        );
        // Get completed chapters for this student
        const completed = await prisma.studentProgress.findMany({
          where: {
            studentId: student.wdt_ID,
            chapterId: { in: chapterIds },
            // isCompleted: true,
          },
        });

        if (completed.length > 0) {
          if (
            completed.filter((p) => p.isCompleted).length === chapterIds.length
          ) {
            completedStudents.push(student);
          } else {
            inProgressStudents.push(student);
          }
        } else {
          notStartedStudents.push(student);
        }
      }
      const inProgressCount = inProgressStudents.length;
      const completedCount = completedStudents.length;
      const notStartedCount = notStartedStudents.length;

      return {
        id: pkg.id,
        packageName: pkg.name,
        totalStudents: assignedTotalStudents,
        notStartedCount,
        inProgressCount,
        completedCount,
      };
    })
  );
  console.log("analytics", analytics);
  return analytics;
}

//  this is new
export async function getStudentAnalyticsperchapter(
  chapterId: string | number,
  searchTerm?: string,
  currentPage?: number,
  itemsPerPage?: number,
  progressFilter?: "notstarted" | "inprogress" | "completed" | "all"
) {
  const page = currentPage && currentPage > 0 ? currentPage : 1;
  const take = itemsPerPage && itemsPerPage > 0 ? itemsPerPage : 10;
  const skip = (page - 1) * take;

  // 1. Get the packageId for this chapter
  const chapter = await prisma.chapter.findUnique({
    where: { id: String(chapterId) },
    select: { course: { select: { packageId: true } } },
  });
  const packageId = chapter?.course?.packageId;

  // 2. Get all subjectPackages for this package
  const subjectPackages = await prisma.subjectPackage.findMany({
    where: { packageId },
    select: {
      subject: true,
      kidpackage: true,
      packageType: true,
    },
    distinct: ["subject", "kidpackage", "packageType"],
  });

  // 3. Build OR filter for students matching any subjectPackage
  const subjectPackageFilters = subjectPackages.map((sp) => ({
    subject: sp.subject,
    package: sp.packageType,
    isKid: sp.kidpackage,
  }));

  // 4. Build search filter
  const searchFilter = searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm } },
          { phoneno: { contains: searchTerm } },
          ...(Number.isNaN(Number(searchTerm))
            ? []
            : [{ wdt_ID: Number(searchTerm) }]),
        ],
      }
    : {};

  // 5. Get ALL students (no skip/take here!)
  const students = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackageFilters,
      ...searchFilter,
    },
    orderBy: { wdt_ID: "asc" },
    select: {
      wdt_ID: true,
      name: true,
      phoneno: true,
      isKid: true,
      chat_id: true,
      activePackage: { select: { name: true } },
    },
  });

  // 6. For each student, get their progress for this chapter
  let studentsWithProgress = await Promise.all(
    students.map(async (student) => {
      const progress = await prisma.studentProgress.findFirst({
        where: {
          studentId: student.wdt_ID,
          chapterId: String(chapterId),
        },
        select: { isCompleted: true },
      });

      let studentProgress: "notstarted" | "inprogress" | "completed" =
        "notstarted";
      if (progress) {
        studentProgress = progress.isCompleted ? "completed" : "inprogress";
      }

      // Format phone number: reverse, last 9 digits, add country code (optional, like package)
      let phoneNo = student.phoneno;
      if (phoneNo) {
        phoneNo = phoneNo.split("").reverse().slice(0, 9).reverse().join("");
        let countryCode = "+251"; // Default Ethiopia
        // You can add country code logic here if needed
        phoneNo = `${countryCode}${phoneNo}`;
      }

      return {
        id: student.wdt_ID,
        name: student.name,
        phoneNo,
        isKid: student.isKid,
        chatid: student.chat_id,
        activePackage: student.activePackage?.name ?? "",
        studentProgress,
      };
    })
  );

  // 7. Filter by progressFilter if provided and not "all"
  if (progressFilter && progressFilter !== "all") {
    studentsWithProgress = studentsWithProgress.filter((student) => {
      if (progressFilter === "inprogress") {
        return student.studentProgress === "inprogress";
      } else {
        return student.studentProgress === progressFilter;
      }
    });
  }

  // 8. Paginate after filtering
  const totalRecords = studentsWithProgress.length;
  const totalPages = Math.ceil(totalRecords / take);
  const paginatedStudents = studentsWithProgress.slice(skip, skip + take);

  return {
    data: paginatedStudents,
    pagination: {
      currentPage: page,
      totalPages,
      itemsPerPage: take,
      totalRecords,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getStudentAnalyticsperPackage(
  searchTerm?: string,
  currentPage?: number,
  itemsPerPage?: number,
  progressFilter?: "notstarted" | "inprogress" | "completed" | "all"
) {
  const page = currentPage && currentPage > 0 ? currentPage : 1;
  const take = itemsPerPage && itemsPerPage > 0 ? itemsPerPage : 10;
  const skip = (page - 1) * take;

  // 1. Get all subjectPackages for this package
  const subjectPackages = await prisma.subjectPackage.findMany({
    select: {
      subject: true,
      kidpackage: true,
      packageType: true,
      packageId: true,
    },
    distinct: ["subject", "kidpackage", "packageType"],
  });

  // 2. Build OR filter for students matching any subjectPackage
  const subjectPackageFilters = subjectPackages.map((sp) => ({
    subject: sp.subject,
    package: sp.packageType,
    isKid: sp.kidpackage,
  }));

  // 3. Build search filter
  const searchFilter = searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm } },
          { phoneno: { contains: searchTerm } },
          ...(Number.isNaN(Number(searchTerm))
            ? []
            : [{ wdt_ID: Number(searchTerm) }]),
        ],
      }
    : {};

  // 4. Get ALL students (no skip/take here!)
  const students = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackageFilters,
      ...searchFilter,
    },
    orderBy: { wdt_ID: "asc" },
    select: {
      wdt_ID: true,
      name: true,
      phoneno: true,
      country: true,
      isKid: true,
      subject: true,
      package: true,
      chat_id: true,
    },
  });

  // 5. For each student, find their subjectPackage and get progress
  let studentsWithProgress = await Promise.all(
    students.map(async (student) => {
      // Find the subjectPackage for this student
      const matchedSubjectPackage = subjectPackages.find(
        (sp) =>
          sp.subject === student.subject &&
          sp.packageType === student.package &&
          sp.kidpackage === student.isKid
      );
      const activePackageId = matchedSubjectPackage?.packageId ?? "";

      const progress = await getStudentProgressStatus(
        student.wdt_ID,
        activePackageId
      );

      const activePackage = await prisma.coursePackage.findUnique({
        where: { id: activePackageId },
        select: { name: true },
      });

      // Format phone number: reverse, last 9 digits, add country code
      let phoneNo = student.phoneno;
      if (phoneNo) {
        phoneNo = phoneNo.split("").reverse().slice(0, 9).reverse().join("");
        let countryCode = "+251"; // Default Ethiopia
        switch ((student.country || "").toLowerCase()) {
          case "ethiopia":
          case "Ethiopia":
            countryCode = "+251";
            break;
          case "Anguilla":
            countryCode = "+1";
            break;
          case "saudiarabia":
          case "Saudi Arabia":
          case "saudi arabia":
            countryCode = "+966";
            break;
          case "canada":
          case "Canada":
            countryCode = "+1";
            break;
          case "dubai":
          case "uae":
          case "United Arab Emirates":
            countryCode = "+971";
            break;
          case "Kuwait":
          case "kuwait":
            countryCode = "+965";
            break;
          case "usa":
          case "United States":
          case "united states of america":
            countryCode = "+1";
            break;
          case "China":
            countryCode = "+86";
            break;
          case "South Africa":
            countryCode = "+27";
            break;
          case "Cuba":
            countryCode = "+53";
            break;
          case "Equatorial Guinea":
            countryCode = "+240";
            break;
          case "Sweden":
            countryCode = "+46";
            break;
          case "Qatar":
            countryCode = "+974";
            break;
          case "Angola":
            countryCode = "+244";
            break;
          case "Pakistan":
            countryCode = "+92";
            break;
          case "Norway":
            countryCode = "+47";
            break;
          case "Netherlands":
            countryCode = "+31";
            break;
          case "Bahrain":
            countryCode = "+973";
            break;
          case "Turkey":
            countryCode = "+90";
            break;
          case "Egypt":
            countryCode = "+20";
            break;
          case "Germany":
            countryCode = "+49";
            break;
          case "Italy":
            countryCode = "+39";
            break;
          case "Djibouti":
            countryCode = "+253";
            break;
          case "Mongolia":
            countryCode = "+976";
            break;
          default:
            countryCode = "+251";
        }
        phoneNo = `${countryCode}${phoneNo}`;
      }

      return {
        id: student.wdt_ID,
        name: student.name,
        phoneNo,
        tglink: `https://t.me/${phoneNo}`,
        whatsapplink: `https://wa.me/${phoneNo}`,
        isKid: student.isKid,
        chatid: student.chat_id,
        activePackage: activePackage?.name ?? "",
        studentProgress: progress,
      };
    })
  );

  // 6. Filter by progressFilter if provided and not "all"
  if (progressFilter && progressFilter !== "all") {
    studentsWithProgress = studentsWithProgress.filter((student) => {
      if (progressFilter === "inprogress") {
        return (
          student.studentProgress !== "completed" &&
          student.studentProgress !== "notstarted"
        );
      } else {
        return student.studentProgress === progressFilter;
      }
    });
  }

  // 7. Paginate after filtering
  const totalRecords = studentsWithProgress.length;
  const totalPages = Math.ceil(totalRecords / take);
  const paginatedStudents = studentsWithProgress.slice(skip, skip + take);

  return {
    data: paginatedStudents,
    pagination: {
      currentPage: page,
      totalPages,
      itemsPerPage: take,
      totalRecords,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function gettheCoutrycode() {}

export async function sendProgressMessages() {
  // 1. Get all subjectPackages for this package
  const subjectPackages = await prisma.subjectPackage.findMany({
    select: {
      subject: true,
      kidpackage: true,
      packageType: true,
      packageId: true,
    },
    distinct: ["subject", "kidpackage", "packageType"],
  });

  // 2. Build OR filter for students matching any subjectPackage
  const subjectPackageFilters = subjectPackages.map((sp) => ({
    subject: sp.subject,
    package: sp.packageType,
    isKid: sp.kidpackage,
  }));

  // 3. Get ALL students (no skip/take here!)
  const students = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackageFilters,
    },
    orderBy: { wdt_ID: "asc" },
    select: {
      wdt_ID: true,
      name: true,
      phoneno: true,
      country: true,
      isKid: true,
      subject: true,
      package: true,
      chat_id: true,
    },
  });

  // 4. For each student, find their subjectPackage and get progress
  const studentsWithProgress = await Promise.all(
    students.map(async (student) => {
      // Find the subjectPackage for this student
      const matchedSubjectPackage = subjectPackages.find(
        (sp) =>
          sp.subject === student.subject &&
          sp.packageType === student.package &&
          sp.kidpackage === student.isKid
      );
      const activePackageId = matchedSubjectPackage?.packageId ?? "";

      const progress = await getStudentProgressStatus(
        student.wdt_ID,
        activePackageId
      );

      return {
        chatid: student.chat_id,
        studId: student.wdt_ID,
        name: student.name,
        progress,
      };
    })
  );

  // Return array of { chatid, progress }
  console.log("Students with progress:", studentsWithProgress);
  return studentsWithProgress;
}
