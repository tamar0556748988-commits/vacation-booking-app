import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-safety',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './safety.html',
  styleUrl: './safety.css'
})
export class Safety {}