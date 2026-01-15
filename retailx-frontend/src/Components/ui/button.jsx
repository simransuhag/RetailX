export function Button({ children, className = "", variant }) {
  const base =
    "px-4 py-2 rounded-xl font-medium transition hover:opacity-90";

  const styles =
    variant === "outline"
      ? "border border-gray-300 text-gray-700"
      : "bg-indigo-600 text-white";

  return <button className={`${base} ${styles} ${className}`}>{children}</button>;
}