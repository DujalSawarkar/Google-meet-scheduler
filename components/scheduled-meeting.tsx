"use client";

import type React from "react";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMeeting } from "@/lib/store/meetingsSlice";
import { generateScheduleLink } from "@/lib/utils";
import { Calendar, Clock, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ScheduledMeeting() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<{
    id: string;
    title: string;
    link: string;
    scheduledFor: string;
  } | null>(null);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const scheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Fix: Proper template literal syntax
    const scheduledDateTime = new Date(`${date}T${time}`);
    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const meeting = {
        id: `scheduled-${Date.now()}`,
        type: "scheduled" as const,
        title,
        link: await generateScheduleLink(title, date, time),
        createdAt: new Date().toISOString(),
        scheduledFor: scheduledDateTime.toISOString(),
      };

      dispatch(addMeeting(meeting));
      setScheduledMeeting({
        id: meeting.id,
        title: meeting.title,
        link: meeting.link,
        scheduledFor: meeting.scheduledFor!,
      });

      // Reset form
      setTitle("");
      setDate("");
      setTime("");

      toast({
        title: "Meeting Scheduled!",
        description: `Your meeting "${title}" has been scheduled.`,
      });
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Meeting link copied to clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Schedule Meeting</span>
        </CardTitle>
        <CardDescription>
          Schedule a Google Meet for a future date and time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={scheduleMeeting} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getTomorrowDate()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isScheduling}
            className="w-full"
            size="lg"
          >
            {isScheduling ? "Scheduling..." : "Schedule Meeting"}
          </Button>
        </form>

        {scheduledMeeting && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-blue-800">
                {scheduledMeeting.title}
              </h3>
              <div className="flex items-center text-sm text-blue-600">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(scheduledMeeting.scheduledFor).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <code className="flex-1 p-2 bg-white border rounded text-sm break-all">
                {scheduledMeeting.link}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(scheduledMeeting.link)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(scheduledMeeting.link, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
