import { useEffect } from "react";

export default function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <div
        className="bg-opacity-50 fixed inset-0 z-30 flex items-center justify-center rounded-xl bg-black/25 p-4 backdrop-blur-sm transition-opacity duration-500 ease-in-out"
        onClick={onClose}
      >
        <div className="relative z-40 rounded-xl bg-white p-4 shadow-lg transition-transform duration-500 ease-in-out">
          {children}
        </div>
      </div>
      <div className="fixed inset-0 z-0 bg-black/40" onClick={onClose}></div>
    </>
  );
}
