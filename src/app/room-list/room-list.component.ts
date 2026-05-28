import { Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css'
})
export class RoomListComponent implements OnInit {
  rooms: any[] = [];
  loading = true;
  searchCity = '';
  searchGuests = 0;
  searchSubCategory = '';
  searchPropertyType = '';
  displayTitle = 'All Properties';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  goToRoom(id: string) {
    this.router.navigate(['/room-details', id]);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchCity = params['city'] || '';
      this.searchSubCategory = params['subCategory'] || '';
      this.searchPropertyType = params['propertyType'] || '';
      this.searchGuests = +(params['adults'] || 0) + +(params['children'] || 0);

      if (this.searchSubCategory) {
        this.displayTitle = this.searchSubCategory;
      } else if (this.searchPropertyType) {
        this.displayTitle = this.searchPropertyType.charAt(0).toUpperCase() + this.searchPropertyType.slice(1);
      } else {
        this.displayTitle = 'All Properties';
      }

      this.loadRooms(params);
    });
  }

  loadRooms(params: any) {
    this.loading = true;

    const queryParamsObj: any = {
      city: params['city'] || '',
      propertyType: params['propertyType'] || '',
      adults: params['adults'] || '0',
      children: params['children'] || '0',
    };

    if (params['subCategory']) {
      queryParamsObj.subCategory = params['subCategory'];
    }

    const query = new URLSearchParams(queryParamsObj).toString();

    this.http.get<any[]>(`http://localhost:3001/api/rooms/search?${query}`)
      .subscribe({
        next: (data) => {
          this.rooms = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error searching rooms:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  goBackHome() {
    this.router.navigate(['/']);
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&q=80&w=600';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3001${imagePath}`;
  }

  onImgError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&q=80&w=600';
  }
}