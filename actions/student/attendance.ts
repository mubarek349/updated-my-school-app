"use server";
import prisma from "@/lib/db";

export default async function getAttendanceofStudent(studentId: number) {
  try {
    const student = await prisma.wpos_wpdatatable_23.findUnique({
      where: { wdt_ID: studentId },
    });

    if (!student) {
      throw new Error("❌ አልተመዘገቡም.");
    }

    const records = await prisma.tarbiaAttendance.findMany({
      where: { studId: studentId },
      select: { status: true },
    });

    if (!records || !Array.isArray(records) || records.length === 0 ) {
      throw new Error("📭 ምንም አቴንዳንስ የለዎትም");
    }

    const presentCount = records.filter(r => r.status === true).length??0;
    const absentCount = records.filter(r => r.status === false).length??0;

    return {
      present: presentCount,
      absent: absentCount,
    };
  } catch {
    throw new Error("አቴንዳንስ ማሳየት ላይ ችግር አለ");
  }
}
export async function getAttendanceofAllStudents(studentIds: number[]) {
  try {
    const students = await prisma.wpos_wpdatatable_23.findMany({
      where: { wdt_ID: { in: studentIds } },
    });

    if (students.length === 0) {
      throw new Error("❌ ተማሪዎች አልተገኙም።");
    }

    const records = await prisma.tarbiaAttendance.findMany({
      where: { studId: { in: studentIds } },
      select: { studId: true, status: true },
    });

    if (records.length === 0) {
      throw new Error("📭 ምንም አቴንዳንስ አልተመዘገበም።");
    }

    // Group attendance by student
    const attendanceMap: Record<number, { present: number; absent: number }> = {};

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
  } catch {
    throw new Error("አቴንዳንስ ማሳየት ላይ ችግር አለ");
  }
}

