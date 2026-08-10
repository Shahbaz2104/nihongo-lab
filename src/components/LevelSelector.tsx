"use client";

import { JLPT_LEVELS } from "@/lib/levels";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function LevelSelector({ value, onChange }: Props) {
  return (
    <SegmentedControl
      options={JLPT_LEVELS.map((l) => ({ id: l, label: l }))}
      value={value}
      onChange={onChange}
    />
  );
}
