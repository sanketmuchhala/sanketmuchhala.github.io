---
layout: project
rank: 2
title: "GTM Simulator"
description: "An open-source AI simulation engine for B2B founders. Simulates Go-To-Market strategies using Mirofish swarm intelligence to test messaging against AI-generated buyer personas."
date: 2024-05-01
categories: ["AI/ML", "Simulation", "Full-Stack"]
technologies: ["Vue 3", "Flask", "Python", "LLM APIs", "Docker"]
github_url: "https://github.com/sanketmuchhala/GTM-SImulator"
demo_url: "https://gtm-s-imulator.vercel.app/"
---

## Overview

Most GTM failures happen because founders never test their assumptions. This tool simulates what happens when your message hits real buyer types - at zero cost, in minutes. Built on top of the Mirofish swarm intelligence engine. This project is a customized fork of the MiroFish engine; please check out original repo as well: [MiroFish](https://github.com/666ghj/MiroFish).

## Key Features

- **Buyer Personas**: AI generates 12 distinct buyer archetypes from your ICP.
- **Message Testing**: Tests outreach variants (pain-first, ROI-first, curiosity-first) against each persona.
- **Buyer Reactions**: Each persona × message pair generates interest scores, objections, and simulated replies.
- **GTM Report**: Winner analysis, best ICP segment, top objections with rebuttals, risk signals, and a 7-day outbound experiment.

## Technical Details

- Frontend: Vue 3 (Composition API)
- Backend: Flask, Python 3.11
- Simulation Engine: Powered by Mirofish / OASIS
- Architecture: No-DB architecture, file-system persistence with deterministic, cached results per run.

## Live Demo

[https://gtm-s-imulator.vercel.app/](https://gtm-s-imulator.vercel.app/)
