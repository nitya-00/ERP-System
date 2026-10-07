import { useApp } from "./AppContext";
import { demoParentChildren, demoStudentId } from "../data/db";

/** Children visible to the signed-in parent (or the student themselves). */
export function useFamily() {
  const { students, role } = useApp();
  const ids = role === "student" ? [demoStudentId] : demoParentChildren;
  return students.filter((s) => ids.includes(s.id));
}
