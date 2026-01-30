import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentService, Content } from '../../../core';
import { LoadingSpinnerComponent } from '../../../shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.scss']
})
export class ContentListComponent implements OnInit, OnDestroy {
  content: Content[] = [];
  filteredContent: Content[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  deleteConfirmId: string | null = null;
  isDeleting = false;

  statusFilter: 'all' | 'published' | 'draft' | 'archived' = 'all';
  searchQuery = '';

  private destroy$ = new Subject<void>();

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadContent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContent(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getContent().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (content: Content[]) => {
        this.content = content.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt || new Date(0);
          const dateB = b.updatedAt || b.createdAt || new Date(0);
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Error loading content:', err);
        this.errorMessage = err.message || 'Failed to load content.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.content];

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === this.statusFilter);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.body.toLowerCase().includes(query) ||
        (c.author && c.author.toLowerCase().includes(query))
      );
    }

    this.filteredContent = filtered;
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteContent(id: string): void {
    this.isDeleting = true;

    this.contentService.deleteContent(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.content = this.content.filter(c => c.id !== id);
        this.applyFilters();
        this.deleteConfirmId = null;
        this.isDeleting = false;
      },
      error: (err: Error) => {
        console.error('Error deleting content:', err);
        this.errorMessage = err.message || 'Failed to delete content.';
        this.deleteConfirmId = null;
        this.isDeleting = false;
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
