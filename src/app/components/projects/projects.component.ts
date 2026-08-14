import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [CommonModule, TranslateModule],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement?: ElementRef<HTMLVideoElement>;
  
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
  private cardObserver?: IntersectionObserver;

  ngOnInit(): void {
    // Component initialization
    
  }

  ngAfterViewInit(): void {
    // Set up Intersection Observer for video pause/play
    setTimeout(() => {
      if (this.videoElement?.nativeElement) {
        this.setupVideoObserver();
      }
      this.setupCardAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.cardObserver) {
      this.cardObserver.disconnect();
    }
  }

  private setupVideoObserver(): void {
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay was prevented, which is fine
            });
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.5 // Trigger when 50% of video is visible
      }
    );

    this.intersectionObserver.observe(video);
  }

  private setupCardAnimations(): void {
    const cards = document.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    this.cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    cards.forEach((card) => {
      this.cardObserver?.observe(card);
    });
  }

  openProject(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  handleVideoError(event: Event): void {
    // Silently handle video load errors - video is optional
    // The component gracefully handles missing video files
  }
}

