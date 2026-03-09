export interface CreateFullReservationInput {
  keycloackClientId: string;
  bookCopyId: string;
  reservedAt?: string;
  dueDate: string;
  returnedAt?: string;
  status?: string;
  daysLate?: number;
  fineAmount?: number;
}
