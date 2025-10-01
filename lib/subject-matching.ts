/**
 * Helper function to check if student subjects contain any of the required subjects
 * This handles comma-separated subjects and performs case-insensitive matching
 *
 * @param studentSubjects - Comma-separated string of student subjects (e.g., "maths,english,physics")
 * @param requiredSubject - Single subject to check against (e.g., "maths")
 * @returns boolean - true if student has the required subject
 *
 * @example
 * hasMatchingSubject("maths,english", "maths") // returns true
 * hasMatchingSubject("maths,english", "physics") // returns false
 * hasMatchingSubject("Maths,English", "maths") // returns true (case-insensitive)
 */
export function hasMatchingSubject(
  studentSubjects: string,
  requiredSubject: string
): boolean {
  if (!studentSubjects || !requiredSubject) return false;

  // Split student subjects by comma and trim
  const studentSubjectList = studentSubjects
    .split(",")
    .map((subject) => subject.trim().toLowerCase())
    .filter((subject) => subject.length > 0);

  // Check if any student subject matches the required subject
  return studentSubjectList.includes(requiredSubject.trim().toLowerCase());
}

/**
 * Helper function to get all subjects from a comma-separated string
 *
 * @param subjectsString - Comma-separated string of subjects
 * @returns string[] - Array of individual subjects
 *
 * @example
 * getSubjectList("maths,english,physics") // returns ["maths", "english", "physics"]
 */
export function getSubjectList(subjectsString: string): string[] {
  if (!subjectsString) return [];

  return subjectsString
    .split(",")
    .map((subject) => subject.trim())
    .filter((subject) => subject.length > 0);
}
