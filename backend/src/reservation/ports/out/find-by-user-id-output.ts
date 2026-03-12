export interface FindByUserIdOutput {
  id: string;
  bookTitle: string;
  bookImage: string | null;
  author: string;
  reservedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: string;
  fineAmount: number | null;
  isOverdue: boolean;
  potentialFine: number | null;
}
