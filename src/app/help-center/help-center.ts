import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './help-center.html',
  styleUrl: './help-center.css'
})
export class HelpCenter {}
