export interface FindByIdReservationOutput {
  id: string;
  keycloackClientId: string;
  bookCopyId: string;
  bookTitle: string;
  bookImage: string | null;
  reservedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: string;
  daysLate?: number;
  fineAmount?: number;
}
