export type EventStatus = "PENDING" | "NOT_COMPLETED" | "COMPLETED";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  userId: string;
};
