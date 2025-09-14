---
layout: project
title: "Project Green Lantern"
description: "Minimalist chat UI for cloud & local LLMs with built-in Prompt Analytics - Build better prompts, faster responses, and clearer insights"
date: 2025-01-01
status: completed
featured: true
categories: ["AI/ML", "Full-Stack", "TypeScript"]
technologies: ["TypeScript", "React", "Node.js", "Vite", "Ollama", "IndexedDB"]
github_url: "https://github.com/sanketmuchhala/Project-Green-Lantern"
---

<div class="project-slideshow">
  <div class="slideshow-container">
    <div class="slide active">
      <img src="https://github.com/user-attachments/assets/914cfd84-2f4a-42c6-8f26-dc93cb1d7ba5" alt="Screenshot 2025-09-13 at 10 56 50 PM" width="720">
    </div>
    <div class="slide">
      <img src="https://github.com/user-attachments/assets/53aa45b1-b9c9-4c29-8f9b-875065061b3d" alt="Screenshot 2025-09-13 at 10 57 04 PM" width="720">
    </div>
    <div class="slide">
      <img src="https://github.com/user-attachments/assets/2e95cd66-0875-4d7f-86e7-3b2bf9410720" alt="Screenshot 2025-09-13 at 10 57 16 PM" width="720">
    </div>
    <div class="slide">
      <img src="https://github.com/user-attachments/assets/49017d28-fba2-4d98-8c19-4e8ffd5e63ff" alt="Screenshot 2025-09-13 at 10 57 31 PM" width="720">
    </div>
    <button class="prev-btn" onclick="changeSlide(-1)">&#10094;</button>
    <button class="next-btn" onclick="changeSlide(1)">&#10095;</button>
  </div>
  <div class="slide-dots">
    <span class="dot active" onclick="currentSlide(1)"></span>
    <span class="dot" onclick="currentSlide(2)"></span>
    <span class="dot" onclick="currentSlide(3)"></span>
    <span class="dot" onclick="currentSlide(4)"></span>
  </div>
</div>

<script>
let slideIndex = 1;

function changeSlide(n) {
  showSlide(slideIndex += n);
}

function currentSlide(n) {
  showSlide(slideIndex = n);
}

function showSlide(n) {
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
  }
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }
  slides[slideIndex - 1].classList.add("active");
  dots[slideIndex - 1].classList.add("active");
}
</script>

<style>
.project-slideshow {
  position: relative;
  max-width: 720px;
  margin: 0 auto 2rem auto;
}

.slideshow-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.slide {
  display: none;
  text-align: center;
}

.slide.active {
  display: block;
}

.slide img {
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.slide img:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.slide {
  position: relative;
}

.slide::after {
  content: '🔍 Click to view fullscreen';
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.slide:hover::after {
  opacity: 1;
}

.prev-btn, .next-btn {
  cursor: pointer;
  position: absolute;
  top: 50%;
  width: auto;
  margin-top: -22px;
  padding: 16px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  background: rgba(0,0,0,0.5);
  border: none;
  user-select: none;
  transition: background 0.3s ease;
}

.next-btn {
  right: 0;
}

.prev-btn:hover, .next-btn:hover {
  background: rgba(0,0,0,0.8);
}

.slide-dots {
  text-align: center;
  margin-top: 15px;
}

.dot {
  cursor: pointer;
  height: 15px;
  width: 15px;
  margin: 0 5px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.dot.active, .dot:hover {
  background-color: #717171;
}
</style>

## Project Overview

Lantern addresses the need for a clean, efficient interface for interacting with both cloud and local AI models. The application provides a distraction-free environment for AI conversations while offering powerful analytics to optimize prompt performance and model usage.

## Key Features

### Minimal, Fast UI
- Thoughtfully spaced, opaque panels with no visual noise
- Distraction-free dark interface optimized for extended use
- Smooth scroll behavior with no jarring jumps during streaming responses

### Cloud + Local Support
- **BYOK Cloud Models**: Plug your API keys for OpenAI, Anthropic, Gemini, DeepSeek
- **Local Ollama Integration**: Run Mistral, Qwen, Llama, Gemma2 on Apple Silicon
- **Performance Mode**: Ultra-fast responses with reduced context for rapid iteration

### Prompt Analytics Dashboard
- **Event Latency Timeline**: Each prompt plotted with latency/TTFT metrics
- **Context Bloat Tracking**: Monitor prompt token efficiency over time
- **Quality vs Cost Analysis**: Scatter plots comparing model performance
- **Real-time System Metrics**: CPU, memory, and Ollama status monitoring
- **Privacy-first**: All data stays in browser IndexedDB

### Thinking HUD
- Abstract progress indicators during model generation
- Phases: Planning → Drafting → Refining
- Metrics: Elapsed time, tokens/second estimates
- Safe: No raw chain-of-thought exposure

## Technical Architecture

### Core Components
- **Router**: Handles both cloud API calls and local Ollama HTTP requests
- **Provider Adapters**: Unified interface for different AI providers
- **Client Logging**: Comprehensive turn instrumentation for analytics
- **IndexedDB Storage**: Local-first data persistence
- **Analytics Engine**: Real-time metrics processing and visualization

### Technology Stack
<div class="project-tech">
    <span class="tech-tag">TypeScript</span>
    <span class="tech-tag">React</span>
    <span class="tech-tag">Node.js</span>
    <span class="tech-tag">Vite</span>
    <span class="tech-tag">Ollama</span>
    <span class="tech-tag">IndexedDB</span>
</div>

## Data Flow Architecture

### Cloud Providers Integration
- **OpenAI**: GPT-4, GPT-3.5-turbo support
- **Anthropic**: Claude models integration
- **Google**: Gemini API support
- **DeepSeek**: Cost-effective alternative models

### Local Stack
- **Ollama Integration**: Native support for local model execution
- **Apple Silicon Optimization**: Performance mode for ultra-fast responses
- **Model Management**: Automatic model loading and status tracking

### Analytics System
- **Turn Instrumentation**: Comprehensive logging of each conversation turn
- **Metrics Collection**: TTFT, latency, token counting, error logging
- **Real-time Visualization**: Live charts and system monitoring
- **Privacy Protection**: Zero data leaves the local machine

## Implementation Highlights

### Smooth Scroll Management
- No jumps when pressing Enter to send messages
- Sticky bottom behavior during streaming responses
- Focus-safe scroll management for accessibility

### Performance Optimizations
- **Performance Mode**: 512 token context limit for speed
- **Short Outputs**: 64 token responses for rapid iteration
- **Conversation Trimming**: Automatic context management
- **Thread Limiting**: 2-thread limit to prevent system overload

### Security & Privacy
- **Local-first Architecture**: Analytics data stays in browser
- **No Telemetry**: Zero data leaves your machine
- **Key Security**: API keys never logged or exposed
- **BYOK Principle**: You control your data and keys

## Development Setup

```bash
# Install dependencies
pnpm install

# Start development
pnpm run dev

# Build production
pnpm run build

# Run tests
pnpm run test
```

## File Structure

```
├── packages/
│   ├── web/           # React frontend
│   │   ├── src/
│   │   │   ├── components/   # UI components
│   │   │   ├── promptops/    # Analytics system
│   │   │   └── hooks/        # Smooth scroll, etc.
│   └── server/        # Node.js backend
│       ├── src/
│       │   ├── providers/    # Cloud/local adapters
│       │   └── routes/       # API endpoints
└── README.md
```

## Key Achievements

- **Unified Interface**: Seamless integration of cloud and local AI models
- **Advanced Analytics**: Comprehensive prompt performance insights
- **Privacy-focused**: Complete local data storage and processing
- **Performance Optimized**: Ultra-fast responses on Apple Silicon
- **Developer-friendly**: Clean architecture with TypeScript throughout

## Technical Challenges Solved

### Challenge 1: Multi-Provider Integration
Creating a unified interface for different AI providers with varying API structures and response formats. The solution involved building adapter patterns and standardized response handling.

### Challenge 2: Real-time Analytics
Implementing comprehensive analytics without impacting performance or privacy. The solution uses IndexedDB for local storage and efficient client-side processing.

### Challenge 3: Local Model Management
Integrating Ollama for local model execution with proper status monitoring and performance optimization. The solution includes automatic model loading and system resource management.

## Future Enhancements

- Additional cloud provider integrations
- Advanced prompt optimization suggestions
- Collaborative features for team usage
- Mobile app development
- Plugin system for custom integrations
- Advanced model comparison tools

## Key Learnings

This project demonstrates the importance of creating unified interfaces for complex AI ecosystems. The combination of cloud and local models provides flexibility while maintaining performance. The analytics system shows how data-driven insights can improve AI interactions without compromising privacy.

## Conclusion

Lantern represents a modern approach to AI chat interfaces that prioritizes both performance and privacy. By combining cloud flexibility with local execution capabilities and comprehensive analytics, it provides a powerful tool for AI practitioners and enthusiasts alike.
