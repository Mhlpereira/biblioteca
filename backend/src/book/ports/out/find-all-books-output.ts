export interface FindAllBooksOutput {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
  totalCopies: number;
  availableCopies: number;
  hasAvailable: boolean;
}
