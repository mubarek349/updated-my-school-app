"use server";
import prisma from "@/lib/db";

export default async function getAttendanceofStudent(studentId: number) {
  try {
    const student = await prisma.wpos_wpdatatable_23.findUnique({
      where: { wdt_ID: studentId },
    });

    if (!student) {
      return undefined;
    }

    const records = await prisma.tarbiaAttendance.findMany({
      where: { studId: studentId },
      select: { status: true },
    });

    if (!records || !Array.isArray(records) || records.length === 0) {
      return undefined;
    }

    const presentCount = records.filter((r) => r.status === true).length ?? 0;
    const absentCount = records.filter((r) => r.status === false).length ?? 0;

    return {
      present: presentCount ?? 0,
      absent: absentCount ?? 0,
    };
  } catch (error) {
    console.error("አቴንዳንስ ማሳየት ላይ ችግር አለ:",error);
    return undefined;
  }
}
export async function getAttendanceofAllStudents(studentIds: number[]) {
  try {
    const students = await prisma.wpos_wpdatatable_23.findMany({
      where: { wdt_ID: { in: studentIds } },
    });

    if (students.length === 0) {
      return {};
    }

    const records = await prisma.tarbiaAttendance.findMany({
      where: { studId: { in: studentIds } },
      select: { studId: true, status: true },
    });

    if (records.length === 0) {
      return {};
    }

    // Group attendance by student
    const attendanceMap: Record<number, { present: number; absent: number }> =
      {};

    for (const id of studentIds) {
      attendanceMap[id] = { present: 0, absent: 0 };
    }

    for (const record of records) {
      if (record.status) {
        attendanceMap[record.studId].present += 1;
      } else {
        attendanceMap[record.studId].absent += 1;
      }
    }

    return attendanceMap;
  } catch (error){
    console.log("አቴንዳንስ ማሳየት ላይ ችግር አለ: ",error);
    return {};
  }
}
