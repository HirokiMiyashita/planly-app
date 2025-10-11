// イベント関連の型定義

export interface Participation {
  id: number;
  userId: string;
  userName: string | null;
  status: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: number;
  day: string;
  start_at: string;
  end_at: string;
  participations: Participation[];
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  isConfirmed: boolean;
  confirmedSlotId: number | null;
  slots: Slot[];
}

export interface SlotData {
  id?: number;
  day: string;
  start_at: string;
  end_at: string;
}

export interface UpdateEventData {
  title: string;
  description: string | null;
  slots: SlotData[];
}

export interface CandidateDate {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
}
