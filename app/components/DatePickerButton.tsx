"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export function DatePickerButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);

  return (
    <div className="relative">
      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <CalendarDays size={16} className="text-[var(--accent)]" />
        {format(selected, "dd/MM/yyyy", { locale: vi })}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 rounded-lg border border-[var(--border)] bg-white p-2 shadow-xl">
          <DayPicker
            mode="single"
            onSelect={(date) => {
              if (!date) {
                return;
              }
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
            selected={selected}
            weekStartsOn={1}
          />
        </div>
      ) : null}
    </div>
  );
}
