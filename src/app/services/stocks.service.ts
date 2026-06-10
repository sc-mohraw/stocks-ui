import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StocksService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getStocks(page: number, limit: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/stocks/all`, {
      params,
      withCredentials: true
    });
  }

  addStock(open: string, close: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stocks/create`, {
      open,
      close
    }, {
      withCredentials: true
    });
  }
}
