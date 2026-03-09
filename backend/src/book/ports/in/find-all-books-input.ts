export interface FindAllBooksInput {
  page?: number;
  limit?: number;
  title?: string;
  author?: string;
  onlyAvailable?: boolean;
  imageUrl?: string;
}