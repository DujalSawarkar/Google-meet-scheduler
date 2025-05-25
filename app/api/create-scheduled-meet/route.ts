import { google } from "googleapis";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      startTime,
      endTime,
      summary = "My Fusion Flow Meet",
      description = "Created via UI",
    } = body;

    console.log("Received scheduling request:", {
      startTime,
      endTime,
      summary,
    });

    if (!startTime) {
      return NextResponse.json({ error: "Missing startTime" }, { status: 400 });
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid startTime format" },
        { status: 400 }
      );
    }

    // Ensure the meeting is scheduled in the future
    if (startDate <= new Date()) {
      return NextResponse.json(
        { error: "Meeting must be scheduled for a future time" },
        { status: 400 }
      );
    }

    const endDate = endTime
      ? new Date(endTime)
      : new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

    console.log("Creating meeting for:", {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      summary,
    });

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token.accessToken as string });

    const calendar = google.calendar({ version: "v3", auth });

    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        description,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        conferenceData: {
          createRequest: {
            requestId: "fusion-flow-meeting-" + Date.now(),
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
        // Ensure the event is properly scheduled (not an instant meeting)
        status: "confirmed",
      },
    });

    const meetLink =
      event.data.hangoutLink ||
      event.data.conferenceData?.entryPoints?.[0]?.uri;

    if (!meetLink) {
      console.error("No meeting link generated:", event.data);
      return NextResponse.json(
        { error: "Failed to generate meeting link" },
        { status: 500 }
      );
    }

    console.log("Successfully created scheduled meeting:", {
      eventId: event.data.id,
      meetLink,
      scheduledTime: startDate.toISOString(),
    });

    return NextResponse.json(
      {
        link: meetLink,
        eventId: event.data.id,
        scheduledFor: startDate.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating scheduled event:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("insufficient permissions")) {
        return NextResponse.json(
          { error: "Insufficient permissions to create calendar events" },
          { status: 403 }
        );
      }
      if (error.message.includes("invalid_grant")) {
        return NextResponse.json(
          { error: "Authentication token expired. Please sign in again." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to create scheduled event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
