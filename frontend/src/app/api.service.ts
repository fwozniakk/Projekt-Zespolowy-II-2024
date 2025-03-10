import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/game'

  constructor(private http: HttpClient) { }

  createGame(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getGameById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`)
  }
}
