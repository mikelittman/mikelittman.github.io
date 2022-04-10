import { useEffect, useState } from "react";

type Year = `${number}${number}${number}${number}`;
type Month = `${number}${number}`;
type Day = `${number}${number}`;

interface YearDurationProps {
  start: `${Year}-${Month}-${Day}`;
}

function diffYears(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}

export function YearDuration({ start }: YearDurationProps) {
  const initialYears: number = diffYears(
    new Date(start),
    new Date()
  );
  const [years, setYears] = useState(initialYears);
  useEffect(() => {
    setYears(initialYears);
  }, [initialYears]);
  return <span>{years} years</span>;
}
