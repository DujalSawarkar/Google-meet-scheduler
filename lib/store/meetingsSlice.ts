import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Meeting {
  id: string;
  type: "instant" | "scheduled";
  title: string;
  link: string;
  createdAt: string;
  scheduledFor: string | null;
}

interface MeetingsState {
  meetings: Meeting[];
}

const initialState: MeetingsState = {
  meetings: [],
};

const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    addMeeting: (state, action: PayloadAction<Meeting>) => {
      state.meetings.push(action.payload);
    },
    clearMeetings: (state) => {
      state.meetings = [];
    },
  },
});

export const { addMeeting, clearMeetings } = meetingsSlice.actions;
export default meetingsSlice.reducer;
