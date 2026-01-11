"use client";

import { useMemo, type ChangeEvent } from "react";
import { Select } from "./Select";
import type { SelectProps, SelectOption } from "./Select";

export interface TimePickerFieldProps
  extends Omit<SelectProps, "options" | "onChange"> {
  /** Currently selected time in HH:mm format */
  value?: string;
  /** Callback when time changes */
  onChange?: (time: string) => void;
  /** Start time in HH:mm format */
  startTime?: string;
  /** End time in HH:mm format */
  endTime?: string;
  /** Interval between time options in minutes */
  interval?: number;
  /** Time format to display (12 or 24 hour) */
  format?: "12h" | "24h";
}

function generateTimeOptions(
  startTime: string,
  endTime: string,
  interval: number,
  format: "12h" | "24h"
): SelectOption[] {
  const options: SelectOption[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const value = `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;

    let label: string;
    if (format === "12h") {
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      label = `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`;
    } else {
      label = value;
    }

    options.push({ value, label });
    currentMinutes += interval;
  }

  return options;
}

/**
 * TimePickerField provides a time selection dropdown.
 */
export function TimePickerField({
  value,
  onChange,
  startTime = "00:00",
  endTime = "23:30",
  interval = 30,
  format = "12h",
  placeholder = "Select time",
  ...props
}: TimePickerFieldProps) {
  const options = useMemo(
    () => generateTimeOptions(startTime, endTime, interval, format),
    [startTime, endTime, interval, format]
  );

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={handleChange as any}
      placeholder={placeholder}
      {...props}
    />
  );
}

TimePickerField.displayName = "TimePickerField";
