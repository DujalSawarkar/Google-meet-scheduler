import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function generateMeetLink(): Promise<string> {
  // Generate a realistic-looking Google Meet link
  const res = await fetch("/api/create-meet", {
    method: "POST",
  });
  console.log("Response:", res);
  const data = await res.json();
  return data.link;
}
// export async function generateScheduleLink(
//   title: string,
//   date: string,
//   time: string
// ): Promise<string> {
//   const startTime = combineDateAndTime(date, time);
//   const endTime = new Date(
//     new Date(startTime).getTime() + 60 * 60 * 1000
//   ).toISOString();
//   const res = await fetch("/api/create-scheduled-meet", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },

//     body: JSON.stringify({
//       startTime,
//       endTime,
//       summary: title || "Team Sync-up",
//       description: "This is a scheduled meeting.",
//     }),
//   });

//   const data = await res.json();
//   return data.link;
// }
// function combineDateAndTime(dateStr: string, timeStr: string): string {
//   const [day, month, year] = dateStr.split("-").map(Number);
//   const [hours, minutes] = timeStr.split(":").map(Number);

//   const date = new Date(year, month - 1, day, hours, minutes);
//   return date.toISOString();
// }
export async function generateScheduleLink(
  title: string,
  date: string,
  time: string
): Promise<string> {
  const startTime = combineDateAndTime(date, time);
  const endTime = new Date(
    new Date(startTime).getTime() + 60 * 60 * 1000
  ).toISOString();

  const res = await fetch("/api/create-scheduled-meet", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startTime,
      endTime,
      summary: title || "Team Sync-up",
      description: `This is a scheduled meeting for ${new Date(
        startTime
      ).toLocaleString()}.`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create scheduled meeting: ${res.statusText}`);
  }

  const data = await res.json();
  return data.link;
}

function combineDateAndTime(dateStr: string, timeStr: string): string {
  // Fix: Proper date parsing for YYYY-MM-DD format
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Create date with proper month (0-indexed in JS Date)
  const date = new Date(year, month - 1, day, hours, minutes);

  // Validate the created date
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date or time format");
  }

  return date.toISOString();
}
