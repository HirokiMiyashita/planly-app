"use client";

import { useEffect, useState } from "react";

interface TimeSelectInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  idPrefix?: string;
  className?: string;
}

const normalizeFromSegments = (hourText: string, minuteText: string) => {
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

const normalizeTimeInput = (rawValue: string) => {
  const value = rawValue.trim();

  if (/^\d{1,2}:\d{1,2}$/.test(value)) {
    const [hourText, minuteText] = value.split(":");
    return normalizeFromSegments(hourText, minuteText);
  }

  if (/^\d{3,4}$/.test(value)) {
    const hourText = value.length === 3 ? value.slice(0, 1) : value.slice(0, 2);
    const minuteText = value.slice(-2);
    return normalizeFromSegments(hourText, minuteText);
  }

  return null;
};

export default function TimeSelectInput({
  value,
  onChange,
  disabled = false,
  idPrefix = "time",
  className = "",
}: TimeSelectInputProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const commitInput = () => {
    const normalized = normalizeTimeInput(inputValue);

    if (!normalized) {
      setInputValue(value);
      return;
    }

    setInputValue(normalized);
    if (normalized !== value) {
      onChange(normalized);
    }
  };

  return (
    <input
      id={`${idPrefix}-text`}
      type="text"
      inputMode="numeric"
      placeholder="09:30"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={commitInput}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commitInput();
          e.currentTarget.blur();
        }
      }}
      disabled={disabled}
      className={`border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base md:text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
