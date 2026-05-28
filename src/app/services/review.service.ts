import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  _id?: string;
  roomId?: string;
  userId?: string;
  name: string;
  initials: string;
  rating: number;
  text: string;
  date: string;
  ownedByCurrentUser: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = 'http://localhost:3001/api/reviews';

  constructor(private http: HttpClient) {}

  getByRoom(roomId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.api}/room/${roomId}`);
  }

  add(payload: {
    roomId: string;
    userId: string;
    text: string;
    rating: number;
  }): Observable<Review> {
    return this.http.post<Review>(this.api, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}