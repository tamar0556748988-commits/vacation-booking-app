import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Room {
  _id?: string;
  name: string;
  title?: string;
  type?: string;
  subCategory?: string;   // ← חדש
  capacity?: number;
  location?: {
    city: string;
    address?: string;
  };
  city?: string;
  price: number;
  pricePerNight?: number;
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  description: string;
  images: string[];
  amenities: string[];
  rating?: number; 
}

export interface Booking {
  _id?: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalPrice: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private roomApi = 'http://localhost:3001/api/rooms';
  private bookApi = 'http://localhost:3001/api/bookings';

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.roomApi);
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.roomApi}/${id}`);
  }

  searchRooms(params: any): Observable<Room[]> {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '' && v !== 0)
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join('&');
    return this.http.get<Room[]>(`${this.roomApi}/search?${query}`);
  }

  // ← פונקציה חדשה במקום getRoomsByCategoryAndAmenity
  getRoomsByTypeAndSubCategory(type: string, subCategory: string): Observable<Room[]> {
    return this.http.get<Room[]>(
      `${this.roomApi}/filter?type=${encodeURIComponent(type)}&subCategory=${encodeURIComponent(subCategory)}`
    );
  }

  addRoom(data: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(this.roomApi, data);
  }

  updateRoom(id: string, data: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.roomApi}/${id}`, data);
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.delete(`${this.roomApi}/${id}`);
  }

  createBooking(data: Partial<Booking>): Observable<Booking> {
    return this.http.post<Booking>(this.bookApi, data as Booking);
  }

  getBookingsByRoom(roomId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.bookApi}/room/${roomId}`);
  }

  getBookedDates(roomId: string): Observable<{ checkIn: string; checkOut: string }[]> {
    return this.http.get<{ checkIn: string; checkOut: string }[]>(
      `${this.bookApi}/booked-dates/${roomId}`
    );
  }

  checkAvailability(roomId: string, checkIn: string, checkOut: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(
      `${this.bookApi}/availability?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
    );
  }
}