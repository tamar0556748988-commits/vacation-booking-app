import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomService, Room, Booking } from '../services/room.service';
import { ReviewsComponent } from '../reviews/reviews';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReviewsComponent
  ],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.css'
})
export class RoomDetailsComponent implements OnInit {

  Math = Math;
  userId: string = 'guest_user_01';
  room: Room | null = null;
  loading = true;
  error = '';
  bookedDates: { checkIn: string; checkOut: string }[] = [];
  selectedImage = 0;
  activeImage: string = '';
  
  // שדה שמחזיק את הדירוג הסופי המחושב עבור ה-HTML
  calculatedRating: number = 0; 

  checkIn  = '';
  checkOut = '';
  adults   = 0;
  children = 0;
  rooms    = 1;
  subCategory = ''; // שדה חדש לשמירת תת-הקטגוריה הנוכחית

  currentUser: any = null;

  apartmentImages = [
    'assets/images/Neutral Beige Living Room with Gold Ring Pendant Lights _.jpg',
    'assets/images/Modern Minimalist Bedroom Design Ideas.jpg',
    'assets/images/Living room design.jpg',
    'assets/images/הורדה (23).jpg',
    'assets/images/הורדה (24).jpg',
    'assets/images/הורדה (25).jpg',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson);
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    // קריאת כל הפרמטרים שהגיעו משורת הכתובת
    const p = this.route.snapshot.queryParams;
    this.checkIn     = p['checkIn']     || '';
    this.checkOut    = p['checkOut']    || '';
    this.adults      = +p['adults']     || 0;
    this.children    = +p['children']   || 0;
    this.rooms       = +p['rooms']      || 1;
    this.subCategory = p['subCategory'] || ''; // קבלת תת-הקטגוריה

    this.roomService.getRoomById(id).subscribe({
      next: (room) => {
        this.room = room;
        this.activeImage = this.displayImages[0];
        this.loading = false;

        // הגדרת דירוג ראשונית מהשרת במידה וקיים
        if (room && 'rating' in room && room['rating']) {
          this.calculatedRating = room['rating'];
        } else {
          this.calculatedRating = 0; 
        }

        this.cdr.detectChanges();
        this.loadBookedDates(id);
      },
      error: () => {
        this.error = 'Room not found.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // פונקציה המחזירה אובייקט פרמטרים עבור כפתור החזרה לדף הבית
  getCurrentParams() {
    return {
      checkIn: this.checkIn || null,
      checkOut: this.checkOut || null,
      adults: this.adults || null,
      children: this.children || null,
      rooms: this.rooms || null,
      subCategory: this.subCategory || this.room?.type || null
    };
  }

  // פונקציה המקבלת את האירוע מקומפוננטת הביקורות ומעדכנת את הציון
  onRatingCalculated(avgRating: any) {
    console.log('Event received from ReviewsComponent with value:', avgRating);
    
    const rating = Number(avgRating);
    if (rating && rating > 0) {
      this.calculatedRating = rating;
    } else {
      this.calculatedRating = 0;
    }
    this.cdr.detectChanges();
  }

  loadBookedDates(roomId: string) {
    this.roomService.getBookedDates(roomId).subscribe({
      next:  (dates) => this.bookedDates = dates,
      error: (err) => console.error('Booked dates error:', err)
    });
  }

  get displayImages(): string[] {
    const filtered = this.room?.images?.filter(img => img && img.trim() !== '') || [];
    return filtered.length > 0 ? filtered : this.apartmentImages;
  }

  get roomPrice(): number {
    return this.room?.price || this.room?.pricePerNight || 0;
  }

  get roomTitle(): string {
    return this.room?.title || this.room?.name || '';
  }

  get roomCity(): string {
    if (!this.room) return '';
    if (this.room.location?.city) return this.room.location.city;
    return this.room.city || '';
  }

  get nightsCount(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const diff = new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  get totalPrice(): number {
    return this.nightsCount * this.roomPrice;
  }

  get isTaken(): boolean {
    if (!this.checkIn || !this.checkOut) return false;
    const newStart = new Date(this.checkIn).getTime();
    const newEnd   = new Date(this.checkOut).getTime();
    return this.bookedDates.some(b => {
      const bStart = new Date(b.checkIn).getTime();
      const bEnd   = new Date(b.checkOut).getTime();
      return newStart < bEnd && newEnd > bStart;
    });
  }

  openBooking() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/booking', this.room!._id]);
  }

  selectImage(i: number) {
    this.selectedImage = i;
    this.activeImage = this.displayImages[i];
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/images/default-fallback.jpg';
    if (imagePath.startsWith('http') || imagePath.startsWith('assets/')) {
      return imagePath;
    }
    return `http://localhost:3001${imagePath}`;
  }

  amenityIcon(amenity: string): string {
    const map: Record<string, string> = {
      'pool':       'ti-swimming-pool',
      'בריכה':      'ti-swimming-pool',
      'jacuzzi':    'ti-wave-sine',
      "ג'קוזי":     'ti-wave-sine',
      'wifi':       'ti-wifi',
      'trampoline': 'ti-bounce-ball',
      'טרמפולינה':  'ti-bounce-ball',
      'bbq':        'ti-grill',
      'מנגל':       'ti-grill',
      'parking':    'ti-parking',
      'חנייה':      'ti-parking',
      'ac':         'ti-air-conditioning',
      'מיזוג':      'ti-air-conditioning',
      'shower':     'ti-shower',
      'מקלחת':      'ti-shower',
      'garden':     'ti-trees',
      'גינה':       'ti-trees',
      'lake view':  'ti-ripple',
      'כינרת':      'ti-ripple',
      'kids':       'ti-baby-carriage',
      'ילדים':      'ti-baby-carriage',
      'kitchen':    'ti-tools-kitchen-2',
      'מטבח':       'ti-tools-kitchen-2',
      'tv':         'ti-device-tv',
      'טלוויזיה':   'ti-device-tv',
    };

    const key = amenity.toLowerCase();
    for (const [word, icon] of Object.entries(map)) {
      if (key.includes(word)) return icon;
    }
    return 'ti-circle-check';
  }
}