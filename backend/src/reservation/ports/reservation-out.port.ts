import { PaginatedResult } from "../../common/interfaces/paginated.interface";
import { Reservation } from "../entities/reservation.entity";
import { ReservationFilters } from "./in/reservation-filters.in";

export interface ReservationOutPort {
  create(data: Partial<Reservation>): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findByUserId(id: string): Promise<PaginatedResult<Reservation>>;
  findByIdWithBookCopy(id: string): Promise<Reservation | null>;
  findAll(filters: ReservationFilters): Promise<PaginatedResult<Reservation>>;
  save(reservation: Reservation): Promise<Reservation>;
  remove(reservation: Reservation): Promise<void>;
}




