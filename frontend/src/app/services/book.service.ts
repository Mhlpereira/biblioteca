import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { FindBooksQuery, Book } from "../core/model/book.models";
import { API_BASE_URL } from "../core/constants/api.constants";

@Injectable({
    providedIn: "root",
})
export class BookService {
    private http = inject(HttpClient);
    private readonly API_URL = `${API_BASE_URL}/books`;

    getBooks(query?: FindBooksQuery): Observable<Book[]> {
        let params = new HttpParams();

        if (query) {
            if (query.title) {
                params = params.set("title", query.title);
            }

            if (query.author) {
                params = params.set("author", query.author);
            }

            if (query.onlyAvailable) {
                params = params.set("onlyAvailable", "true");
            }
        }

        return this.http.get<Book[]>(this.API_URL, { params });
    }
}
