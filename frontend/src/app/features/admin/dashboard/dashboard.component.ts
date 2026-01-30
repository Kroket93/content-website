import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService, Content } from '../../../core';
import { LoadingSpinnerComponent } from '../../../shared';
import { Subject, takeUntil, forkJoin } from 'rxjs';

interface ContentStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: ContentStats = {
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  };
  recentContent: Content[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getContent().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (content: Content[]) => {
        this.stats = {
          total: content.length,
          published: content.filter(c => c.status === 'published').length,
          draft: content.filter(c => c.status === 'draft').length,
          archived: content.filter(c => c.status === 'archived').length
        };

        this.recentContent = content
          .sort((a, b) => {
            const dateA = a.updatedAt || a.createdAt || new Date(0);
            const dateB = b.updatedAt || b.createdAt || new Date(0);
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          })
          .slice(0, 5);

        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Error loading dashboard data:', err);
        this.errorMessage = err.message || 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
        return 'status-published';
      case 'draft':
        return 'status-draft';
      case 'archived':
        return 'status-archived';
      default:
        return '';
    }
  }
}
