export interface UpdateReservationInput {
  id: string;
  status?: string;
  returnedAt?: Date;
  daysLate?: number;
  fineAmount?: number;
}
