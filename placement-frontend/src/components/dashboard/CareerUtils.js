export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || "trial-token"}`,
});

export function formatDate(value) {
  if (!value) return "Flexible";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
