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

  // 2. Get all progress records for this student and these chapters
  const progress = await prisma.studentProgress.findMany({
    where: {
      studentId,
      chapterId: { in: chapterIds },
    },
    select: { isCompleted: true, chapterId: true },
  });

  // 3. Logic
  if (chapterIds.length === 0 || progress.length === 0) {
    return "notstarted";
  }
  if (progress.some((p) => !p.isCompleted)) {
    // Find the first incomplete chapter's id
    const firstIncomplete = progress.find((p) => !p.isCompleted);
    // Find the chapter details for that id
    const chapter = chapters.find((ch) => ch.id === firstIncomplete?.chapterId);
    const chapterTitle = chapter?.title ?? null;
    const courseTitle = chapter?.course?.title ?? null;
    const packageName = chapter?.course?.package?.name ?? null;
    return `${packageName} > ${courseTitle} > ${chapterTitle}`;
  }
  return "completed";
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

    // if thhe pass data is packageid and not start  then return the chat_id of student not start,if t=pass complete then return the chatid of student completed and if onprogress then return the chatid of student in progress
    if (chapterIds.length === 0 || progress.length === 0) {
      // Not started
      if (status === "notstarted" && student.chat_id) {
        // notStartedChatIds.push(student.chat_id);
        filteredChatIds.push(student.chat_id);
      }
    } else if (progress.every((p) => p.isCompleted)) {
      // Completed
      if (status === "completed" && student.chat_id) {
        // completedChatIds.push(student.chat_id);
        filteredChatIds.push(student.chat_id);
      }
    } else if (progress.some((p) => !p.isCompleted)) {
      // In-progress
      if (student.chat_id) {
        const percent = getProgressPercent(progress, chapterIds.length);
        if (status === "inprogress_10" && percent <= 10) {
          filteredChatIds.push(student.chat_id);
        } else if (status === "inprogress_40" && percent > 10 && percent <= 40) {
          filteredChatIds.push(student.chat_id);
        } else if (status === "inprogress_70" && percent > 40 && percent <= 70) {
          filteredChatIds.push(student.chat_id);
        } else if (status === "inprogress_o" && percent > 70) {
          filteredChatIds.push(student.chat_id);
        }
      }
    } else {
      filteredChatIds.push("fuad");
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
  if (total === 0) return 0;
  const completed = progress.filter((p) => p.isCompleted).length;
  return Math.round((completed / total) * 100);
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

    if (chapterIds.length === 0 || progress.length === 0) {
      // Not started
        notStartedChatIds.push(student.wdt_ID.toString());
    } else if (progress.every((p) => p.isCompleted)) {
      // Completed
      completedChatIds.push(student.wdt_ID+"");
    } else if (progress.some((p) => !p.isCompleted)) {
      // In-progress
      const percent = getProgressPercent(progress, chapterIds.length);
      if (percent <= 10) inProgress10ChatIds.push(student.wdt_ID+'');
      else if (percent <= 40) inProgress40ChatIds.push(student.wdt_ID+'');
      else if (percent <= 70) inProgress70ChatIds.push(student.wdt_ID+'');
      else inProgressOtherChatIds.push(student.wdt_ID+'');
    }
  }

  // Assign to one object and return
  const result = [
    { status: "notstarted", count: notStartedChatIds.length },
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
    where:{
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
            isCompleted: true,
          },
        });
        if (chapterIds.length > 0 && completed.length === chapterIds.length) {
          completedStudents.push(student);
        } else if (
          completed.length > 0 &&
          completed.length < chapterIds.length
        ) {
          inProgressStudents.push(student);
        }
        else{
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
console.log("analytics",analytics);
  return analytics;
}

//  this is new
export async function getStudentAnalyticsperchapter(
  chapterId: string | number,
  searchTerm?: string,
  currentPage?: number,
  itemsPerPage?: number,
  progressFilter?: "notstarted" | "inprogress" | "completed" // <-- Add this
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
          // Only add wdt_ID filter if searchTerm is a valid number
          ...(Number.isNaN(Number(searchTerm))
            ? []
            : [{ wdt_ID: Number(searchTerm) }]),
        ],
      }
    : {};

  // 5. Count total students matching subjectPackages and search
  const totalRecords = await prisma.wpos_wpdatatable_23.count({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackageFilters,
      ...searchFilter,
    },
  });

  // 6. Get paginated students
  const students = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackageFilters,
      ...searchFilter,
    },
    skip,
    take,
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

  // 7. For each student, get their progress for this chapter
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

      return {
        id: student.wdt_ID,
        name: student.name,
        phoneNo: student.phoneno,
        isKid: student.isKid,
        chatid: student.chat_id,
        activePackage: student.activePackage?.name ?? "",
        studentProgress,
      };
    })
  );
  if (progressFilter) {
    studentsWithProgress = studentsWithProgress.filter(
      (student) => student.studentProgress === progressFilter
    );
  }
  const totalPages = Math.ceil(totalRecords / take);
  // const totalPages = Math.ceil(studentsWithProgress.length / take);

  return {
    data: studentsWithProgress,
    pagination: {
      currentPage: page,
      totalPages,
      itemsPerPage: take,
      totalRecords,
      // totalRecords:studentsWithProgress.length ,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getStudentAnalyticsperPackage(
  // chapterId: string | number,
  searchTerm?: string,
  currentPage?: number,
  itemsPerPage?: number,
  progressFilter?: "notstarted" | "inprogress" | "completed" // <-- Add this
) {
  const page = currentPage && currentPage > 0 ? currentPage : 1;
  const take = itemsPerPage && itemsPerPage > 0 ? itemsPerPage : 2;
  const skip = (page - 1) * take;

  // 1. Get the packageId for this chapter
  // const chapter = await prisma.chapter.findUnique({
  //   where: { id: String(chapterId) },
  //   select: { course: { select: { packageId: true } } },
  // // });
  // const packageId = chapter?.course?.packageId;

  // 2. Get all subjectPackages for this package
  const subjectPackages = await prisma.subjectPackage.findMany({
    select: {
      subject: true,
      kidpackage: true,
      packageType: true,
      packageId: true,
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
          // Only add wdt_ID filter if searchTerm is a valid number
          ...(Number.isNaN(Number(searchTerm))
            ? []
            : [{ wdt_ID: Number(searchTerm) }]),
        ],
      }
    : {};

  // 5. Count total students matching subjectPackages and search
  const totalRecords = await prisma.wpos_wpdatatable_23.count({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackageFilters,
      ...searchFilter,
    },
  });

  // 6. Get paginated students
  const students = await prisma.wpos_wpdatatable_23.findMany({
    where: {
      status: { in: ["Active", "Not yet"] },
      OR: subjectPackageFilters,
      ...searchFilter,
    },
    skip,
    take,
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

  // 7. For each student, find their subjectPackage and get progress
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

      // help me plase  i went to return the phone number by reverse and only the last 9 digits and add a country code based on the country
      let phoneNo = student.phoneno;
      if (phoneNo) {
        // Reverse the phone number and take the last 9 digits
        phoneNo = phoneNo.split("").reverse().slice(0, 9).reverse().join("");
        // Add country code based on the country
        let countryCode = "+251"; // Default Ethiopia
        switch ((student.country || "").toLowerCase()) {
          case "ethiopia":
            countryCode = "+251";
            break;
          case "saudiarabia":
          case "saudi arabia":
            countryCode = "+966";
            break;
          case "canada":
            countryCode = "+1";
            break;
          case "dubai":
          case "uae":
            countryCode = "+971";
            break;
          case "kuweit":
          case "kuwait":
            countryCode = "+965";
            break;
          case "usa":
          case "united states":
          case "united states of america":
            countryCode = "+1";
            break;
          case "south africa":
            countryCode = "+27";
            break;
          case "sweden":
            countryCode = "+46";
            break;
          case "qatar":
            countryCode = "+974";
            break;
          case "djibouti":
            countryCode = "+253";
            break;
          // Add more countries as needed
          default:
            countryCode = "+251";
        }
        phoneNo = `${countryCode}${phoneNo}`;
      }

      return {
        id: student.wdt_ID,
        name: student.name,
        phoneNo: student.phoneno,
        isKid: student.isKid,
        chatid: student.chat_id,
        activePackage: activePackage?.name ?? "",
        studentProgress: progress,
      };
    })
  );

  if (progressFilter) {
    studentsWithProgress = studentsWithProgress.filter((student) => {
      if (progressFilter === "inprogress") {
        return (
          student.studentProgress !== "completed" &&
          student.studentProgress !== "notstarted"
        );
      }
      return student.studentProgress === progressFilter;
    });
  }
  const totalPages = Math.ceil(totalRecords / take);
  // const totalPages = Math.ceil(studentsWithProgress.length / take);

  return {
    data: studentsWithProgress,
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
