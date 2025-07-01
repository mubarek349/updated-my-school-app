"use server";
import prisma from "@/lib/db";

export async function allPackages() {
  const packages = await prisma.coursePackage.findMany();
  return packages;
}