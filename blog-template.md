# Blog System Documentation

This documentation explains the complete blog system implementation for your portfolio website.

## Blog System Overview

The blog system consists of:
1. **Homepage Blog Section** - Preview cards in `index.html`
2. **Blog Index Page** - Full blog listing at `/blogs/index.html`
3. **Individual Blog Posts** - Dedicated pages for each post (e.g., `/blogs/understanding-llms.html`)
4. **Blog Template** - Reusable template for creating new posts

## File Structure

```
/
├── index.html (main portfolio with blog preview)
├── blogs/
│   ├── index.html (blog listing page)
│   ├── blog-template.html (template for new posts)
│   └── ai-vs-human-brain.html (single blog post)
```

## Homepage Blog Section

The blog section is located in `index.html` within the `#blog` section. Each blog post is structured as an `<article>` element with the class `blog-card`.

## Adding a New Blog Post

To add a new blog post, copy the following template and replace the content:

```html
<article class="blog-card">
    <div class="blog-image">
        <img src="YOUR_IMAGE_URL_HERE" alt="Blog post description">
    </div>
    <div class="blog-content">
        <div class="blog-meta">
            <span class="blog-date">Month Day, Year</span>
            <span class="blog-category">Category</span>
        </div>
        <h3 class="blog-title">Your Blog Post Title</h3>
        <p class="blog-excerpt">
            A brief excerpt or summary of your blog post. Keep it concise and engaging 
            to encourage readers to click through to read the full post.
        </p>
        <a href="#" class="blog-read-more">Read More <i class="fas fa-arrow-right"></i></a>
    </div>
</article>
```

## Image Guidelines

### Option 1: Using Real Images
- Upload your image to a hosting service (like GitHub, Imgur, or your own server)
- Replace `YOUR_IMAGE_URL_HERE` with the actual image URL
- Recommended size: 400x200 pixels
- Supported formats: JPG, PNG, WebP

### Option 2: Using SVG Placeholders (Current Implementation)
The current blog posts use inline SVG placeholders. To create a new one:

```html
<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtd2VpZ2h0PSI1MDAiIGZvbnQtc2l6ZT0iMTYiPkJsb2cgSW1hZ2UgUGxhY2Vob2xkZXI8L3RleHQ+Cjwvc3ZnPgo=" alt="Your description">
```

## Content Guidelines

### Blog Categories
Use relevant categories for your content:
- `AI/ML` - Artificial Intelligence and Machine Learning topics
- `Data Science` - Data analysis, statistics, visualization
- `Programming` - Coding techniques, languages, frameworks
- `Technology` - General tech topics
- `Career` - Professional development, career advice
- `Tutorial` - Step-by-step guides

### Title Guidelines
- Keep titles concise but descriptive (50-60 characters max)
- Use action words and compelling language
- Make it SEO-friendly with relevant keywords

### Excerpt Guidelines
- 2-3 sentences maximum
- Focus on the value proposition
- End with intrigue to encourage clicking
- Avoid spoiling the main content

## Blog Post Order

Blog posts are displayed in the order they appear in the HTML. Place newer posts at the top of the blog grid for chronological ordering.

## Styling Notes

The blog section uses:
- Dark theme with `--background-card` backgrounds
- Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Hover animations and transitions
- Typography consistent with the site's design system

## Mobile Optimization

The blog section is fully responsive:
- Mobile: Single column layout
- Tablet: Two column layout  
- Desktop: Three column layout
- All cards have consistent max-width and spacing

## Example: Complete Blog Section

```html
<section id="blog" class="blog">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">Latest Blog Posts</h2>
            <div class="section-divider"></div>
        </div>
        <div class="blog-grid">
            <!-- Your blog posts go here -->
            <!-- Use the template above for each post -->
        </div>
    </div>
</section>
```

This structure ensures your blog section integrates seamlessly with the portfolio's design and remains fully responsive across all devices.