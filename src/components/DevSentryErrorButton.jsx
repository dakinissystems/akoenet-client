export default function DevSentryErrorButton() {
  const show =
    import.meta.env.DEV ||
    String(import.meta.env.VITE_SENTRY_TEST_BUTTON || "").toLowerCase() === "true";

  if (!show) return null;
  if (!import.meta.env.VITE_SENTRY_DSN?.trim()) return null;

  return (
    <button
      type="button"
      onClick={() => {
        throw new Error("This is your first error!");
      }}
      style={{
        position: "fixed",
        bottom: 12,
        right: 12,
        zIndex: 99999,
        padding: "8px 12px",
        fontSize: 12,
        background: "#c0392b",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
      }}
      title="Sentry verify — quitar en producción"
    >
      Break the world
    </button>
  );
}
