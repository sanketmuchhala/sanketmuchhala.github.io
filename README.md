# Sanket Muchhala - Personal Portfolio

A modern, responsive personal portfolio website built with Jekyll. Features a clean design, blog functionality, and project showcase.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Blog System**: Write and manage blog posts with Jekyll collections
- **Project Showcase**: Display your projects with detailed descriptions
- **Photography Gallery**: Showcase your photography work
- **SEO Optimized**: Built-in SEO tags and meta descriptions
- **Fast Loading**: Optimized for performance with critical CSS and lazy loading

## Technology Stack

- **Jekyll**: Static site generator
- **HTML5/CSS3**: Modern web standards
- **JavaScript**: Interactive features and theme switching
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Inter font family)

## Getting Started

### Prerequisites

- Ruby (version 2.6 or higher)
- RubyGems
- GCC and Make

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanketmuchhala/sanketmuchhala.github.io.git
   cd sanketmuchhala.github.io
   ```

2. **Install Jekyll and dependencies**
   ```bash
   bundle install
   ```

3. **Run the development server**
   ```bash
   bundle exec jekyll serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4000` to view your site.

## Project Structure

```
sanketmuchhala.github.io/
├── _layouts/              # Jekyll layouts
│   ├── default.html      # Base layout
│   ├── project.html      # Project page layout
│   └── blog.html         # Blog post layout
├── _projects/            # Project collection
│   └── mcp-project.md    # Individual project files
├── _blogs/               # Blog collection
│   └── ai-vs-human-brain.md
├── _config.yml           # Jekyll configuration
├── Gemfile               # Ruby dependencies
├── index.md              # Home page
├── projects.html         # Projects index
├── blogs.html            # Blog index
├── style.css             # Main stylesheet
├── script.js             # JavaScript functionality
└── photography/          # Photography assets
```

## Adding Content

### New Project

1. Create a new markdown file in `_projects/` directory
2. Add front matter with project details:

```yaml
---
layout: project
title: "Your Project Title"
description: "Project description"
date: 2025-01-01
status: completed
categories: ["Category1", "Category2"]
technologies: ["Tech1", "Tech2"]
github_url: "https://github.com/username/repo"
deployment_url: "https://demo.example.com"
featured_image: "/path/to/image.jpg"
---
```

3. Add your project content below the front matter

### New Blog Post

1. Create a new markdown file in `_blogs/` directory
2. Add front matter with post details:

```yaml
---
layout: blog
title: "Your Blog Post Title"
description: "Post description"
date: 2025-01-01
categories: ["Category"]
tags: ["tag1", "tag2"]
read_time: 5
featured_image: "/path/to/image.jpg"
---
```

3. Write your blog post content below the front matter

## Customization

### Styling

- Edit `style.css` to modify the appearance
- The site uses CSS custom properties for easy theming
- Dark/light theme colors are defined in the `:root` selector

### Configuration

- Edit `_config.yml` to change site settings
- Update personal information, social links, and site metadata
- Modify collections and plugins as needed

### Navigation

- Update navigation links in `_layouts/default.html`
- Add or remove menu items as needed

## Deployment

### GitHub Pages

This site is configured for GitHub Pages deployment:

1. Push your changes to the main branch
2. GitHub Pages will automatically build and deploy your site
3. Your site will be available at `https://sanketmuchhala.github.io`

### Other Hosting

For other hosting providers:

1. Build the site locally:
   ```bash
   bundle exec jekyll build
   ```

2. Upload the contents of the `_site` directory to your web server

## Performance Optimization

The site includes several performance optimizations:

- **Critical CSS**: Inline critical styles for above-the-fold content
- **Lazy Loading**: Images load only when needed
- **WebP Images**: Modern image format with fallbacks
- **Minified Assets**: Compressed CSS and JavaScript
- **Preloading**: Critical resources are preloaded

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

- **Email**: sanketmuchhala@gmail.com
- **LinkedIn**: [linkedin.com/in/sanketmuchhala](https://www.linkedin.com/in/sanketmuchhala/)
- **GitHub**: [github.com/sanketmuchhala](https://github.com/sanketmuchhala)
