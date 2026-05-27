"use client";

interface TimeSelectInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  idPrefix?: string;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

const normalizeTime = (value: string) => {
  const [rawHour = "09", rawMinute = "00"] = value.split(":");
  const hour = rawHour.padStart(2, "0").slice(-2);
  const minute = rawMinute.padStart(2, "0").slice(-2);
  return { hour, minute };
};

export default function TimeSelectInput({
  value,
  onChange,
  disabled = false,
  idPrefix = "time",
  className = "",
}: TimeSelectInputProps) {
  const { hour, minute } = normalizeTime(value);

  const handleHourChange = (nextHour: string) => {
    onChange(`${nextHour}:${minute}`);
  };

  const handleMinuteChange = (nextMinute: string) => {
    onChange(`${hour}:${nextMinute}`);
  };

  return (
    <div
      className={`grid grid-cols-[1fr_auto_1fr] items-center gap-2 ${className}`}
    >
      <select
        id={`${idPrefix}-hour`}
        value={hour}
        onChange={(e) => handleHourChange(e.target.value)}
        disabled={disabled}
        className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-xs text-gray-500">:</span>
      <select
        id={`${idPrefix}-minute`}
        value={minute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        disabled={disabled}
        className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
