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
function combineDateAndTime(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Create a local Date object using input date and time
  const localDate = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(localDate.getTime())) {
    throw new Error("Invalid date or time format");
  }

  // Convert local time to ISO string in UTC (required by most APIs)
  return localDate.toISOString();
}

export async function generateScheduleLink(
  title: string,
  date: string,
  time: string
): Promise<string> {
  // Combine date and time, get start time in ISO format (UTC)
  const startTime = combineDateAndTime(date, time);
  const startDateTime = new Date(startTime);
  const now = new Date();

  // Validate that start time is in the future
  if (startDateTime <= now) {
    throw new Error(
      "Scheduled meeting time must be in the future. Please select a later time."
    );
  }

  // Calculate end time as 1 hour after start time, also in ISO UTC format
  const endTime = new Date(
    startDateTime.getTime() + 60 * 60 * 1000
  ).toISOString();

  // Call your API to create the scheduled meeting
  const res = await fetch("/api/create-scheduled-meet", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startTime,
      endTime,
      summary: title || "Team Sync-up",
      description: `This is a scheduled meeting for ${startDateTime.toLocaleString()}.`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create scheduled meeting: ${res.statusText}`);
  }

  const data = await res.json();
  return data.link;
}
