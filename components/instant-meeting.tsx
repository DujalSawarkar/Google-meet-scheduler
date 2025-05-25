"use client";

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
import { addMeeting } from "@/lib/store/meetingsSlice";
import { generateMeetLink } from "@/lib/utils";
import { Video, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InstantMeeting() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<{
    id: string;
    link: string;
    createdAt: string;
  } | null>(null);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const createInstantMeeting = async () => {
    setIsGenerating(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const meeting = {
      id: `instant-${Date.now()}`,
      type: "instant" as const,
      title: "Instant Meeting",
      link: await generateMeetLink(),
      createdAt: new Date().toISOString(),
      scheduledFor: null,
    };

    dispatch(addMeeting(meeting));
    setCurrentMeeting({
      id: meeting.id,
      link: meeting.link,
      createdAt: meeting.createdAt,
    });
    setIsGenerating(false);

    toast({
      title: "Meeting Created!",
      description: "Your instant meeting link is ready.",
    });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <span>Instant Meeting</span>
        </CardTitle>
        <CardDescription>
          Create a Google Meet link immediately for instant use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={createInstantMeeting}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? "Generating..." : "Create Instant Meeting"}
        </Button>

        {currentMeeting && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-green-800">Meeting Ready!</h3>
              <span className="text-sm text-green-600">
                {new Date(currentMeeting.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <code className="flex-1 p-2 bg-white border rounded text-sm break-all">
                {currentMeeting.link}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(currentMeeting.link)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(currentMeeting.link, "_blank")}
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
