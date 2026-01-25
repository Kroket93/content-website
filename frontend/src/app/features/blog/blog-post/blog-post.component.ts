import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContentService, Content } from '../../../core';
import { LoadingSpinnerComponent } from '../../../shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit, OnDestroy {
  post: Content | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  sanitizedContent: SafeHtml | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService: ContentService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadPost(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPost(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getContentById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (post: Content) => {
        this.post = post;
        this.sanitizedContent = this.sanitizeHtml(post.body);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading post:', err);
        this.errorMessage = err.message || 'Failed to load post. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }

  shareOnTwitter(): void {
    if (!this.post) return;
    const text = encodeURIComponent(this.post.title);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  shareOnLinkedIn(): void {
    if (!this.post) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  shareOnFacebook(): void {
    if (!this.post) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  }
}
