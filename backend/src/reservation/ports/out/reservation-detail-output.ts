export interface ReservationDetailOutput {
  id: string;
  keycloackClientId: string;
  bookCopyId: string;
  reservedAt: Date;
  dueDate: Date;
  returnedAt?: Date | null;
  status: string;
  daysLate?: number;
  fineAmount?: number;
}
