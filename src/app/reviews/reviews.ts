import { Component, Input, OnInit, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../services/review.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.html',
  styleUrls: ['./reviews.css']
})
export class ReviewsComponent implements OnInit {
  @Input() roomId: string = '';
  @Input() currentUserId: string | null = null;

  // הוספת צינור השידור ששולח את הציון הממוצע האמיתי לקומפוננטת האב
  @Output() ratingCalculated = new EventEmitter<number>();

  // Modern state management using Angular Signals
  reviews = signal<Review[]>([]);
  newRating = signal<number>(0);
  hoverRating = signal<number>(0);
  newText = signal<string>('');
  loading = signal<boolean>(false);
  errorMsg = signal<string>('');

  readonly starsArray = [1, 2, 3, 4, 5];

  // Computed signal to automatically recalculate average score
  avgRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return '0.0';
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  constructor(private reviewService: ReviewService) {
    // שימוש ב-effect של Signals: בכל פעם שרשימת הביקורות משתנה, הממוצע נשלח אוטומטית לאבא!
    effect(() => {
      const currentAvg = parseFloat(this.avgRating());
      this.ratingCalculated.emit(currentAvg);
    });
  }

  ngOnInit(): void {
    if (!this.roomId) return;
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getByRoom(this.roomId).subscribe({
      next: (data: Review[]) => {
        const mapped = data.map((r: Review) => ({
          ...r,
          ownedByCurrentUser: r.userId === this.currentUserId
        }));
        this.reviews.set(mapped);
      },
      error: (err: Error) => console.error('Failed to load reviews', err)
    });
  }

  submitReview(): void {
    const textTrimmed = this.newText().trim();
    if (!this.newRating() || !textTrimmed) return;
    
    if (!this.currentUserId) {
      this.errorMsg.set('Please log in to post a review.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    this.reviewService.add({
      roomId: this.roomId,
      userId: this.currentUserId,
      text: textTrimmed,
      rating: this.newRating()
    }).subscribe({
      next: (saved: Review) => {
        // Prepend the new review to the array reactively
        this.reviews.set([{ ...saved, ownedByCurrentUser: true }, ...this.reviews()]);
        
        // Reset form inputs
        this.newRating.set(0);
        this.newText.set('');
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.errorMsg.set('Failed to post review. Try again.');
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  deleteReview(id: string): void {
    if (!confirm('Are you sure you want to delete this review?')) return;

    this.reviewService.delete(id).subscribe({
      next: () => {
        // Filter out the deleted review seamlessly without reloading
        this.reviews.set(this.reviews().filter(r => r._id !== id));
      },
      error: (err: Error) => console.error('Failed to delete review', err)
    });
  }
}