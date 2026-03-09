export interface FindByUserIdOutput {
  id: string;
  bookTitle: string;
  bookImage: string | null;
  reservedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: string;
  fineAmount: number | null;
  isOverdue: boolean;
  potentialFine: number | null;
}
