import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentService, Content } from '../../../core';
import { LoadingSpinnerComponent } from '../../../shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-content-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss']
})
export class ContentEditorComponent implements OnInit, OnDestroy {
  isEditMode = false;
  contentId: string | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  formData: Partial<Content> = {
    title: '',
    body: '',
    excerpt: '',
    featuredImage: '',
    author: '',
    tags: [],
    status: 'draft'
  };

  tagsInput = '';

  private destroy$ = new Subject<void>();

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.contentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.contentId;

    if (this.isEditMode && this.contentId) {
      this.loadContent(this.contentId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContent(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getContentById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (content: Content) => {
        this.formData = {
          title: content.title,
          body: content.body,
          excerpt: content.excerpt || '',
          featuredImage: content.featuredImage || '',
          author: content.author || '',
          tags: content.tags || [],
          status: content.status
        };
        this.tagsInput = (content.tags || []).join(', ');
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Error loading content:', err);
        this.errorMessage = err.message || 'Failed to load content.';
        this.isLoading = false;
      }
    });
  }

  onTagsInputChange(): void {
    this.formData.tags = this.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  saveContent(): void {
    if (!this.formData.title?.trim()) {
      this.errorMessage = 'Title is required.';
      return;
    }

    if (!this.formData.body?.trim()) {
      this.errorMessage = 'Content body is required.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const contentData: Partial<Content> = {
      title: this.formData.title.trim(),
      body: this.formData.body.trim(),
      excerpt: this.formData.excerpt?.trim() || null,
      featuredImage: this.formData.featuredImage?.trim() || null,
      author: this.formData.author?.trim() || undefined,
      tags: this.formData.tags && this.formData.tags.length > 0 ? this.formData.tags : null,
      status: this.formData.status
    };

    const saveObservable = this.isEditMode && this.contentId
      ? this.contentService.updateContent(this.contentId, contentData)
      : this.contentService.createContent(contentData);

    saveObservable.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (savedContent: Content) => {
        this.isSaving = false;
        this.successMessage = this.isEditMode
          ? 'Content updated successfully!'
          : 'Content created successfully!';

        if (!this.isEditMode) {
          this.router.navigate(['/admin/content', savedContent.id, 'edit']);
        }
      },
      error: (err: Error) => {
        console.error('Error saving content:', err);
        this.errorMessage = err.message || 'Failed to save content.';
        this.isSaving = false;
      }
    });
  }

  saveAndPublish(): void {
    this.formData.status = 'published';
    this.saveContent();
  }

  saveAsDraft(): void {
    this.formData.status = 'draft';
    this.saveContent();
  }
}
