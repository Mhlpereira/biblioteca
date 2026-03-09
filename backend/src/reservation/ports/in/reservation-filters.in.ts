export interface ReservationFilters {
  page: number;
  limit: number;
  clientId?: string;
  bookId?: string;
  reservedAt?: string;
  dueDate?: string;
  returnedAt?: string;
  status?: string;
  overdueOnly?: boolean;
}
