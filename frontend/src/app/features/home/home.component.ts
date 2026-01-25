import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenantService, ContentService } from '../../core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(
    private tenantService: TenantService,
    private contentService: ContentService
  ) {}

  ngOnInit(): void {
    // Initialize home page data
    console.log('Home component initialized');
  }
}
