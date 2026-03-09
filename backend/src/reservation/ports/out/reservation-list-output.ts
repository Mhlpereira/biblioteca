export interface ReservationListOutput {
  id: string;
  clientName: string;
  bookTitle: string;
  bookImage: string | null;
  author: string;
  reservedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: string;
  fineAmount: number | null;
  isOverdue: boolean;
  potentialFine: number;
}
