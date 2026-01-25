import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService, Content, ContentListResponse } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogListComponent implements OnInit, OnDestroy {
  posts: Content[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  currentPage = 1;
  pageSize = 6;
  totalPosts = 0;
  totalPages = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private contentService: ContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getContentList({
      status: 'published',
      page: this.currentPage,
      pageSize: this.pageSize
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: ContentListResponse) => {
        this.posts = response.items;
        this.totalPosts = response.total;
        this.totalPages = Math.ceil(response.total / this.pageSize);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading posts:', err);
        this.errorMessage = err.message || 'Failed to load posts. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
}
