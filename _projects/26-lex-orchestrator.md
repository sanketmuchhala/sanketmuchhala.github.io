---
layout: project
rank: 1
title: "LexOrchestrator"
description: "Litigation workflow agent demo with a multi-agent orchestration pipeline. Features hybrid RAG retrieval, citation verification, adversarial review, and eval scoring in a structured workspace."
date: 2024-06-01
categories: ["AI/ML", "Legal Tech", "NLP", "Full-Stack"]
technologies: ["Next.js", "TypeScript", "Supabase", "RAG", "MCP"]
github_url: "https://github.com/sanketmuchhala/LexOrchestrator"
demo_url: "https://lex-orchestrator.vercel.app/"
---

## Overview

LexOrchestrator is a litigation workflow agent demo. It takes a legal drafting request through eight sequential specialist agents -- intake, retrieval, drafting, citation verification, adversarial review, local rules review, judge brief preparation, and eval scoring -- and surfaces the results in a structured workspace UI.

## Key Features

- **Multi-Agent Orchestration**: Eight specialist agents run sequentially, building on prior context.
- **Hybrid RAG Retrieval**: Combines keyword scoring, vector cosine similarity, and authority boosts over indexed court opinions.
- **Citation Verification**: Checks every citation in the draft against indexed opinions for existence, quote accuracy, and treatment status.
- **Adversarial Review**: A red-team agent generates opposing-counsel critiques, finding weaknesses and unsupported claims.
- **MCP Server**: Includes a stdio MCP server exposing nine litigation tools.

## Technical Details

- Built with Next.js, React, and TypeScript.
- Data persistence and authentication via Supabase.
- Ephemeral in-memory mode and deterministic fallback agents for local development without API keys.
- Comprehensive observability dashboard and per-run agent trace viewer.

## Live Demo

[https://lex-orchestrator.vercel.app/](https://lex-orchestrator.vercel.app/)
