import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomService, Room } from '../services/room.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css'
})
export class BookingFormComponent implements OnInit {

  room!: Room;
  checkIn = '';
  checkOut = '';
  adults = 1;
  children = 0;
  rooms = 1;
  bookedDates: any[] = [];

  guestName = '';
  guestEmail = '';
  step: 1 | 2 | 3 = 1;
  loading = false;
  serverErrorMessage = '';

  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.guestName = user.name || user.fullName || '';
        this.guestEmail = user.email || '';
      } catch {}
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.roomService.getRoomById(id).subscribe({
      next: (room) => {
        this.room = room;
        this.cdr.detectChanges();
        this.loadBookedDates(id);
      },
      error: () => this.router.navigate(['/'])
    });
  }

  loadBookedDates(roomId: string) {
    this.roomService.getBookedDates(roomId).subscribe({
      next: (dates: any) => {
        this.bookedDates = dates;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Booked dates error:', err)
    });
  }

  // ── Getters ──────────────────────────────────────────

  get currentUser() {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }

  get isEmailMismatch(): boolean {
    if (!this.currentUser || !this.guestEmail) return false;
    return this.guestEmail.toLowerCase() !== this.currentUser.email.toLowerCase();
  }

  get isCapacityExceeded(): boolean {
    const max = this.room?.maxGuests || 0;
    return (Number(this.adults) + Number(this.children)) > max;
  }

  get isDateConflict(): boolean {
    if (!this.checkIn || !this.checkOut) return false;
    const chosenIn  = new Date(this.checkIn).getTime();
    const chosenOut = new Date(this.checkOut).getTime();
    if (chosenOut <= chosenIn) return false;         // תאריך יציאה לפני כניסה
    return this.bookedDates.some(b => {
      const bIn  = new Date(b.checkIn  || b.checkInDate).getTime();
      const bOut = new Date(b.checkOut || b.checkOutDate).getTime();
      return chosenIn < bOut && chosenOut > bIn;
    });
  }

  get canContinue(): boolean {
    return !!(
      this.guestName.trim() &&
      this.guestEmail.trim() &&
      !this.isEmailMismatch &&
      !this.isCapacityExceeded &&
      !this.isDateConflict &&
      this.currentUser &&
      this.checkIn &&
      this.checkOut
    );
  }

  // ── Actions ──────────────────────────────────────────

  nextStep() {
    if (this.canContinue) {
      this.serverErrorMessage = '';
      this.step = 2;
      this.cdr.detectChanges();
    }
  }

  goBack() {
    this.router.navigate(['/room-details', this.room._id]);
  }

  submitBooking() {
    this.loading = true;
    this.serverErrorMessage = '';
    this.cdr.detectChanges();

    const user = this.currentUser;
    const userId = user?._id || user?.id || null;

    const bookingData: any = {
      room:         this.room._id,
      roomId:       this.room._id,
      user:         userId,
      guestName:    this.guestName,
      guestEmail:   this.guestEmail,
      phone:        user?.phone || '050-0000000',
      checkIn:      this.checkIn,
      checkOut:     this.checkOut,
      checkInDate:  this.checkIn,
      checkOutDate: this.checkOut,
      adults:       Number(this.adults)   || 1,
      children:     Number(this.children) || 0,
      rooms:        Number(this.rooms)    || 1,
      totalPrice:   Number(this.room.price) || 0,
    };

    this.roomService.createBooking(bookingData).subscribe({
      next: () => {
        this.loading = false;
        this.step = 3;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.serverErrorMessage =
          (typeof err.error === 'string' && err.error)
            ? err.error
            : err.error?.message || 'Booking failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}