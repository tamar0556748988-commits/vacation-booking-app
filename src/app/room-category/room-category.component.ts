import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomService, Room } from '../services/room.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './room-category.component.html',
  styleUrl: './room-category.component.css'
})
export class RoomCategoryComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  categoryName = '';

  constructor(
    private active: ActivatedRoute,
    private router: Router,
    private s: RoomService
  ) {}

  ngOnInit() {
    this.active.queryParamMap.subscribe(params => {
      const type        = params.get('type')        || '';
      const subCategory = params.get('subCategory') || '';

      console.log('type:', type, 'subCategory:', subCategory);

      this.loading = true;
      this.rooms = [];
      this.categoryName = subCategory || type;

      this.s.getRoomsByTypeAndSubCategory(type, subCategory).subscribe({
        next: (data: Room[]) => {
          this.rooms = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error(err);
          this.loading = false;
        }
      });
    });
  }

  goToRoom(id: string | undefined) {
    if (id) this.router.navigate(['/room-details', id]);
  }
  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&q=80&w=600';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3001${imagePath}`;
  }
  onImgError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&q=80&w=600';
  }
}