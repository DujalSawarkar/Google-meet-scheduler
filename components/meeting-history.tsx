"use client"

import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { RootState } from "@/lib/store"
import { History, Copy, ExternalLink, Calendar, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function MeetingHistory() {
  const meetings = useSelector((state: RootState) => state.meetings.meetings)
  const { toast } = useToast()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Meeting link copied to clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const sortedMeetings = [...meetings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Meeting History</span>
        </CardTitle>
        <CardDescription>Your recently created meetings ({meetings.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMeetings.map((meeting) => (
            <div key={meeting.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {meeting.type === "instant" ? (
                      <Video className="h-4 w-4 text-green-600" />
                    ) : (
                      <Calendar className="h-4 w-4 text-blue-600" />
                    )}
                    <h3 className="font-medium">{meeting.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        meeting.type === "instant" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {meeting.type}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Created: {new Date(meeting.createdAt).toLocaleString()}</p>
                    {meeting.scheduledFor && <p>Scheduled: {new Date(meeting.scheduledFor).toLocaleString()}</p>}
                  </div>

                  <div className="mt-2 flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-gray-100 border rounded text-sm break-all">{meeting.link}</code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(meeting.link)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => window.open(meeting.link, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
