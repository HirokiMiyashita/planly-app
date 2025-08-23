export interface Event {
  id: number;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  slots: EventSlot[];
}

export interface EventSlot {
  id: number;
  day: string;
  start_at: string;
  end_at: string;
  event_id: number;
}

export interface CreateEventRequest {
  eventName: string;
  description: string;
  candidateDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  defaultStartTime: string;
  defaultEndTime: string;
  createdBy: string;
}
