"use client"

import { useSession, signOut } from "next-auth/react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InstantMeeting } from "./instant-meeting"
import { ScheduledMeeting } from "./scheduled-meeting"
import { MeetingHistory } from "./meeting-history"
import type { RootState } from "@/lib/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MeetingScheduler() {
  const { data: session } = useSession()
  const meetings = useSelector((state: RootState) => state.meetings.meetings)

  return (
    <div className="space-y-6">
      {/* User Info Header */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
              <p className="text-gray-600">{session?.user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Meeting Creation Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <InstantMeeting />
        <ScheduledMeeting />
      </div>

      {/* Meeting History */}
      {meetings.length > 0 && <MeetingHistory />}
    </div>
  )
}
