export interface ReservationFilters {
  page: number;
  limit: number;
  search?: string;
  clientId?: string;
  bookId?: string;
  reservedAt?: string;
  dueDate?: string;
  returnedAt?: string;
  status?: string;
  overdueOnly?: boolean;
}
