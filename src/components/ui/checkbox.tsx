import { motion } from "motion/react";

export default function Checkbox({
  checked,
  onChange,
  size = "h-5 w-5",
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  size?: string;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      whileTap={{ scale: 0.85 }}
      className={`relative flex ${size} shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-colors duration-200 ${
        checked
          ? "border-[#863bff] bg-[#863bff]"
          : "border-gray-300 bg-white hover:border-gray-400"
      }`}
    >
      <motion.svg viewBox="0 0 16 16" className="h-3 w-3 text-white">
        <motion.path
          d="M3 8.5 L6.5 12 L13 4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.button>
  );
}
