import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../core/model/user.model";
import { API_BASE_URL } from "../core/constants/api.constants";
import { FindClientParams } from "../core/model/client.model";
import { PaginatedResult } from "../core/model/pagination.model";

@Injectable({
    providedIn: "root",
})
export class AdminService {
    private http = inject(HttpClient);
    private readonly API_URL = `${API_BASE_URL}`;

    findAll(filters: FindClientParams): Observable<PaginatedResult<User>> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
            params = params.set(key, value);
        }
    });

    return this.http.get<PaginatedResult<User>>(`${this.API_URL}/clients/findAll`, { 
        params, 
        withCredentials: true 
    });
  }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${userId}`, { withCredentials: true });
    }
}
