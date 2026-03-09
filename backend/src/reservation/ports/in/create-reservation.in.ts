export interface CreateReservationInput {
  keycloackClientId: string;
  bookId: string;
  dueDate?: string;
}