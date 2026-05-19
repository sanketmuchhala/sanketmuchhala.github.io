---
layout: project
rank: 3
title: "Mirofish API Server"
description: "A monetized prediction API powered by the MiroFish swarm intelligence engine. Spawns multi-agent simulations where diverse AI agents debate and collectively predict outcomes."
date: 2024-04-01
categories: ["AI/ML", "Backend", "API"]
technologies: ["Python", "FastAPI", "Web3", "LLM APIs", "Docker"]
github_url: "https://github.com/sanketmuchhala/mirofish-api-server"
---

## Overview

A monetized prediction API powered by the MiroFish swarm intelligence engine. I forked and configured this to host Mirofish as a seamless endpoint. It spawns multi-agent simulations where diverse AI agents debate, analyze, and collectively predict outcomes — then returns a structured prediction report.

## Key Features

- **Multi-Agent Swarm Simulation**: 10-500 agents with diverse roles (Analyst, Skeptic, Expert, Journalist, Activist, etc.).
- **Multi-Round Emergent Behavior**: Agents build on each other's outputs across rounds.
- **Structured Prediction Reports**: Narratives, trends, sentiment distribution, and sample agent actions.
- **x402 Payments**: Integrated payments powered by x402 on Base USDC.
- **MCP Compatible**: Discoverable via an MCP endpoint for tool integration.

## Technical Details

- Built with FastAPI (Python 3.11+).
- Docker containerized for easy deployment (e.g., to Railway).
- Mirrors the MiroFish OASIS simulation engine logic.
