export type ReservationAction = 'created' | 'updated' | 'returned' | 'deleted';

export interface ReservationEvent {
  id: string;
  idempotencyKey: string;
  action: ReservationAction;
  keycloackClientId: string;
  bookCopyId?: string;
  bookId?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookImageUrl?: string | null;
  bookImage?: string | null;
  reservedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  isReturned: boolean;
  status: string;
  daysLate?: number;
  fineAmount?: number;
  ts: string;
}
