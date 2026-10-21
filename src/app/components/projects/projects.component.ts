import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RevealDirective } from '../../directives/reveal.directive';

interface Project {
  name: string;
  description: string;
  url?: string;
  imageUrl?: string;
  videoSrc?: string;
  type: 'link' | 'video';
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, TranslateModule, RevealDirective],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement?: ElementRef<HTMLVideoElement>;

  selectedVideo?: Project;

  projects: Project[] = [
    {
      name: 'projects.stringSistemas.name',
      description: 'projects.stringSistemas.description',
      url: 'https://www.stringsistemas.com/',
      imageUrl: 'assets/images/string-sistemas.png',
      type: 'link'
    },
    {
      name: 'Concrete Quality',
      description: 'Industrial SaaS platform for concrete production and quality control.',
      url: 'https://www.concrete-quality.com/',
      imageUrl: 'assets/images/cq.png',
      type: 'link'
    },
    {
      name: 'Hippie House TV',
      description: 'Creative studio and audiovisual production website.',
      url: 'https://www.hippiehouse.tv/index.html',
      imageUrl: 'assets/images/hh.png',
      type: 'link'
    },
    {
      name: 'Ariane quick preview',
      description: "Quick tour around Ariane in it's mobile and desktop versions.",
      videoSrc: 'assets/videos/videoariane.mp4',
      type: 'video'
    }
  ];

  private intersectionObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.setupVideoObserver();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.setScrollLock(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedVideo) this.closeVideo();
  }

  // Play the preview only while it's on screen
  private setupVideoObserver(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.selectedVideo) {
          video.play().catch(() => {
            // Autoplay was prevented, which is fine
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    this.intersectionObserver.observe(video);
  }

  openVideo(project: Project): void {
    this.selectedVideo = project;
    this.videoElement?.nativeElement.pause();
    this.setScrollLock(true);
  }

  closeVideo(): void {
    this.selectedVideo = undefined;
    this.setScrollLock(false);
    this.videoElement?.nativeElement.play().catch(() => {});
  }

  private setScrollLock(locked: boolean): void {
    document.body.style.overflow = locked ? 'hidden' : '';
  }
}
