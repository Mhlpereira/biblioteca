export interface ReturnBookOutput {
  id: string;
  status: string;
  returnedAt: Date | null | undefined;
  daysLate?: number;
  fineAmount?: number;
}
