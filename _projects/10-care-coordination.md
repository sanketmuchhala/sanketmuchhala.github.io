---
layout: project
title: "Care Coordination Healthcare"
description: "Analyzed healthcare disparities between rural and urban regions, visualizing cost structures, availability, and Medicare payment differences across the U.S."
date: 2024-06-01
status: completed
featured: false
categories: ["Data Visualization", "Healthcare"]
technologies: ["Python", "Data Visualization", "Matplotlib", "Pandas", "Seaborn", "Statistical Analysis"]
github_url: "https://github.com/sanketmuchhala/care-coordination"
---

<div class="project-slideshow">
  <div class="slideshow-container">
    <div class="slide active">
      <img src="https://github.com/user-attachments/assets/9aa5422d-b55d-4544-9f9a-2986eedd4b7d" alt="Screenshot 2025-09-14 at 2 01 28 AM" width="720">
    </div>
    <div class="slide">
      <img src="https://github.com/user-attachments/assets/605ddb5a-5040-415d-aaed-a333ead1142b" alt="Screenshot 2025-09-14 at 2 01 21 AM" width="720">
    </div>
    <div class="slide">
      <img src="https://github.com/user-attachments/assets/1cfdd11a-236f-43c4-9e6f-299a97ab173c" alt="Screenshot 2025-09-14 at 2 01 15 AM" width="720">
    </div>
    <div class="slide">
      <img src="https://github.com/user-attachments/assets/0b413784-7159-4cf9-b690-d61a66fa7210" alt="Screenshot 2025-09-14 at 1 54 47 AM" width="720">
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

The healthcare system in the United States faces significant challenges, particularly in rural areas where access to quality care is increasingly limited. This project investigates the systemic disparities between rural and urban healthcare systems, analyzing cost structures, service availability, and Medicare payment patterns to identify areas where intervention is most needed.

## Technical Architecture

### Core Components
- **Data Collection System:** Automated extraction from CMS, AHA, and other healthcare databases
- **Data Processing Pipeline:** Python-based ETL processes for healthcare data standardization
- **Statistical Analysis Engine:** Comparative analysis between rural and urban healthcare metrics
- **Visualization Platform:** Interactive charts and maps for data exploration
- **Report Generation System:** Automated creation of comprehensive healthcare disparity reports

### Key Technologies
<div class="project-tech">
    <span class="tech-tag">Python</span>
    <span class="tech-tag">Data Visualization</span>
    <span class="tech-tag">Matplotlib</span>
    <span class="tech-tag">Pandas</span>
    <span class="tech-tag">Seaborn</span>
    <span class="tech-tag">Statistical Analysis</span>
</div>

## Implementation Details

### Healthcare Data Analysis
1. Collected data from Centers for Medicare & Medicaid Services (CMS) on hospital costs and payments
2. Analyzed American Hospital Association (AHA) data on hospital characteristics and services
3. Processed rural-urban classification data to categorize healthcare facilities
4. Implemented statistical tests to identify significant differences between regions

### Disparity Analysis Framework
- Cost structure analysis comparing rural vs. urban hospital expenses
- Service availability mapping across different geographic regions
- Medicare payment analysis to identify funding inequities
- Patient outcome correlation with geographic and economic factors

### Visualization and Reporting
1. Created interactive dashboards showing regional healthcare disparities
2. Developed choropleth maps highlighting areas with healthcare access challenges
3. Generated comparative charts for cost structures and service availability
4. Built automated reporting system for ongoing monitoring of healthcare disparities

## Results & Impact
- Identified 23% higher average costs in rural hospitals compared to urban counterparts
- Discovered 40% fewer specialized services available in rural healthcare facilities
- Revealed 15% lower Medicare payments per patient in rural areas
- Mapped 47 counties with critical healthcare access challenges
- Provided data-driven insights for healthcare policy recommendations

## Challenges & Solutions

### Challenge 1: Data Quality and Consistency
Healthcare data from different sources often had inconsistent formats and missing values. The solution involved implementing robust data cleaning pipelines, standardization procedures, and imputation strategies to ensure data quality across all sources.

### Challenge 2: Rural-Urban Classification Complexity
Defining clear boundaries between rural and urban areas was complex due to varying classification systems. This was resolved by implementing a multi-criteria classification approach that considered population density, geographic isolation, and healthcare infrastructure.

### Challenge 3: Statistical Significance in Small Populations
Rural areas often have smaller populations, making statistical analysis challenging. The solution involved using appropriate statistical tests for small sample sizes and implementing bootstrapping methods to ensure robust statistical inference.

## Future Enhancements
- Implement real-time healthcare disparity monitoring dashboard
- Add machine learning models for predicting healthcare access challenges
- Develop predictive analytics for healthcare resource allocation
- Integrate with additional healthcare quality and outcome metrics
- Create interactive tools for healthcare administrators and policy makers
- Expand analysis to include international healthcare system comparisons

## Key Learnings

This project demonstrated the critical importance of data quality and standardization in healthcare analytics. Working with multiple healthcare data sources required careful attention to data governance and privacy considerations. Additionally, the project highlighted the value of clear visualization in communicating complex healthcare disparities to diverse stakeholders, from healthcare professionals to policy makers.

## Conclusion

The Care Coordination Healthcare project successfully demonstrates how data analysis and visualization can uncover critical insights into healthcare system disparities. By systematically analyzing cost structures, service availability, and payment patterns, the research provides a foundation for understanding and addressing healthcare access challenges in rural areas. The project showcases the practical application of data science in healthcare policy and demonstrates how data-driven insights can inform efforts to create more equitable healthcare systems.