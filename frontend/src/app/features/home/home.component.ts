import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenantService, ContentService, Content, Tenant } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  tenant: Tenant | null = null;
  featuredPosts: Content[] = [];
  recentPosts: Content[] = [];
  isLoadingFeatured = true;
  isLoadingRecent = true;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private tenantService: TenantService,
    private contentService: ContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tenantService.currentTenant$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(tenant => {
      this.tenant = tenant;
    });

    this.loadFeaturedPosts();
    this.loadRecentPosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFeaturedPosts(): void {
    this.isLoadingFeatured = true;

    this.contentService.getContentList({
      status: 'published',
      pageSize: 3
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.featuredPosts = response.items.slice(0, 3);
        this.isLoadingFeatured = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading featured posts:', err);
        this.errorMessage = err.message || 'Failed to load featured posts.';
        this.isLoadingFeatured = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadRecentPosts(): void {
    this.isLoadingRecent = true;

    this.contentService.getContentList({
      status: 'published',
      pageSize: 6
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.recentPosts = response.items.slice(0, 6);
        this.isLoadingRecent = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading recent posts:', err);
        this.errorMessage = err.message || 'Failed to load recent posts.';
        this.isLoadingRecent = false;
        this.cdr.detectChanges();
      }
    });
  }

  retryLoading(): void {
    this.errorMessage = null;
    this.loadFeaturedPosts();
    this.loadRecentPosts();
  }
}
