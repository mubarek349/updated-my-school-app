import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

(async () => {
  // Seed Admin
  await prisma.admin.create({
    data: {
      id: "clg1v2j4f0000l5v8xq3z7h4d",
      name: "System Admin",
      phoneno: "0911223344",
      passcode: "admin123",
    },
  });

  // Seed Students
  await prisma.wpos_wpdatatable_23.createMany({
    data: [
      {
        wdt_ID: 1001,
        name: "Mubarak Ahmed",
        passcode: "student1",
        phoneno: "0910203040",
        status: "active",
        subject: "hifz",
        chat_id: "973677019",
      },
      {
        wdt_ID: 1002,
        name: "Fuad Abdurahman",
        subject: "hifz",
        passcode: "student2",
        phoneno: "0910203041",
        status: "active",
        chat_id: "611321369",
      },
      {
        wdt_ID: 1003,
        subject: "hifz",
        name: "Abdulkarim ahmed",
        passcode: "student3",
        phoneno: "0910203042",
        status: "active",
        chat_id: "973677021",
      },
    ],
  });

  // Seed Packages
  await prisma.coursePackage.createMany({
    data: [
      {
        id: "pkg_001",
        userId: "clg1v2j4f0000l5v8xq3z7h4d",
        name: "Qaida",
        userType: "GENERAL",
      },
      {
        id: "pkg_002",
        userId: "clg1v2j4f0000l5v8xq3z7h4d",
        name: "Hifz",
        userType: "GENERAL",
      },
      {
        id: "pkg_003",
        userId: "clg1v2j4f0000l5v8xq3z7h4d",
        name: "hadis",
        userType: "ADULT",
      },
    ],
  });

  // Assign packages to students
  await prisma.wpos_wpdatatable_23.update({
    where: { wdt_ID: 1001 },
    data: {
      packages: {
        connect: [{ id: "pkg_001" }, { id: "pkg_002" }],
      },
      activePackage: {
        connect: { id: "pkg_001" },
      },
    },
  });

  await prisma.wpos_wpdatatable_23.update({
    where: { wdt_ID: 1002 },
    data: {
      packages: {
        connect: [{ id: "pkg_001" }],
      },
      activePackage: {
        connect: { id: "pkg_001" },
      },
    },
  });

  // Seed Courses for Programming Package
  await prisma.course.createMany({
    data: [
      {
        id: "course_001",
        title: "HAREKA",
        description: "Introduction to programming concepts",
        isPublished: true,
        order: 1,
        packageId: "pkg_001",
        imageUrl: "",
      },
      {
        id: "course_002",
        title: "TENWIN",
        description: "Learn OOP principles",
        isPublished: true,
        order: 2,
        packageId: "pkg_001",
        imageUrl: "",
      },
    ],
  });

  // Seed Courses for Web Dev Package
  await prisma.course.createMany({
    data: [
      {
        id: "course_101",
        title: "Haraka",
        description: "Build beautiful web pages",
        isPublished: true,
        order: 1,
        packageId: "pkg_002",
        imageUrl: "",
      },
      {
        id: "course_102",
        title: "tanwin",
        description: "Complete JS from basics to advanced",
        isPublished: true,
        order: 2,
        packageId: "pkg_002",
        imageUrl: "",
      },
    ],
  });

  // Seed Chapters for Programming Basics Course
  await prisma.chapter.createMany({
    data: [
      {
        id: "chapter_001",
        title: "FETHA",
        description: "Learn about variables and basic data types",
        position: 1,
        isPublished: true,
        courseId: "course_001",
        videoUrl: "n7WNUaxPo8A",
      },
      {
        id: "chapter_002",
        title: "KESRA",
        description: "If statements and loops",
        position: 2,
        isPublished: true,
        courseId: "course_001",
        videoUrl: "Cv0I54sHMB8",
      },
      {
        id: "chapter_003",
        title: "DOMA",
        description: "Creating and using functions",
        position: 3,
        isPublished: true,
        courseId: "course_001",
        videoUrl: "oR5aGowK5V4",
      },
    ],
  });

  // Seed Chapters for OOP Course
  await prisma.chapter.createMany({
    data: [
      {
        id: "chapter_011",
        title: "SUKUN",
        description: "Introduction to OOP concepts",
        position: 1,
        isPublished: true,
        courseId: "course_002",
        videoUrl: "YbJAnbfN33o",
      },
      {
        id: "chapter_012",
        title: "FETHATAIB",
        description: "Understanding class inheritance",
        position: 2,
        isPublished: true,
        courseId: "course_002",
        videoUrl: "JnvWYDDxFuA",
      },
    ],
  });

  // --- SEED 5 QUESTIONS WITH OPTIONS FOR EACH CHAPTER ---

  const chapters = [
    "chapter_001",
    "chapter_002",
    "chapter_003",
    "chapter_011",
    "chapter_012",
  ];

  for (const chapterId of chapters) {
    for (let i = 1; i <= 5; i++) {
      const question = await prisma.question.create({
        data: {
          chapterId,
          question: `Sample Question ${i} for ${chapterId}`,
          questionOptions: {
            create: [
              { option: `Option 1 for Q${i}` },
              { option: `Option 2 for Q${i}` },
              { option: `Option 3 for Q${i}` },
              { option: `Option 4 for Q${i}` },
            ],
          },
        },
        include: { questionOptions: true },
      });

      // Optionally, set the first option as the correct answer
      await prisma.questionAnswer.create({
        data: {
          questionId: question.id,
          answerId: question.questionOptions[0].id,
        },
      });
    }
  }

  // Seed Student Progress for Completed Student
  await prisma.studentProgress.createMany({
    data: [
      // Student 1 completed all chapters in Course 1
      {
        studentId: 1001,
        chapterId: "chapter_001",
        isCompleted: true,
        completedAt: new Date("2023-02-01"),
      },
      {
        studentId: 1001,
        chapterId: "chapter_002",
        isCompleted: true,
        completedAt: new Date("2023-02-15"),
      },
      {
        studentId: 1001,
        chapterId: "chapter_003",
        isCompleted: true,
        completedAt: new Date("2023-02-28"),
      },
      // Student 1 completed all chapters in Course 2
      {
        studentId: 1001,
        chapterId: "chapter_011",
        isCompleted: true,
        completedAt: new Date("2023-03-10"),
      },
      {
        studentId: 1001,
        chapterId: "chapter_012",
        isCompleted: true,
        completedAt: new Date("2023-03-15"),
      },
    ],
  });

  // Seed Student Progress for In-Progress Student
  await prisma.studentProgress.createMany({
    data: [
      // Student 2 completed first chapter
      {
        studentId: 1002,
        chapterId: "chapter_001",
        isCompleted: true,
        completedAt: new Date("2023-03-05"),
      },
      // Student 2 started second chapter but didn't complete
      {
        studentId: 1002,
        chapterId: "chapter_002",
        isCompleted: false,
      },
    ],
  });

  console.log("🌱 Database seeded successfully with:");
  console.log("- 1 Admin user");
  console.log("- 3 Students with different progress levels");
  console.log("- 3 Packages (2 published, 1 unpublished)");
  console.log("- 4 Courses (2 in each published package)");
  console.log("- 5 Chapters with video content");
  console.log("- 5 Questions (with 4 options each) for every chapter");
  console.log("- Complete package history for testing");
  console.log("- Realistic student progress data");
  process.exit(0);
})().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
