# Brandboard AI

## Product Requirements Document (V1)

### Vision

Brandboard AI is an AI-powered brand research and creative strategy platform that automatically generates comprehensive brand audits, moodboards, visual inspiration systems, and strategic insights from a simple prompt.

Users can enter:

* A company name
* A website URL
* A creative concept
* An industry

and receive an organized research workspace within seconds.

Examples:

* Audit Airbnb
* Audit Sweetgreen
* Luxury skincare startup
* Japanese-inspired wellness brand
* Sustainable coffee company

The platform combines AI research, brand intelligence, visual discovery, and moodboarding into a single workflow.

---

# Problem

Creative professionals currently spend hours:

* Searching Google
* Browsing Pinterest
* Reviewing Instagram
* Searching Behance
* Collecting screenshots
* Organizing references

This process is fragmented and time consuming.

Brandboard AI compresses research from hours into minutes.

---

# Target Users

Primary

* Brand Designers
* Creative Directors
* Marketing Teams
* Design Students
* Agencies

Secondary

* Startup Founders
* Product Designers
* Consultants
* Researchers

---

# Core User Flow

1. User enters prompt
2. System gathers data
3. AI analyzes findings
4. Moodboard generated
5. User edits board
6. User exports board

---

# MVP Features

## Feature 1: Brand Audit

Input:

Airbnb

Output:

* Logo
* Company summary
* Mission
* Positioning
* Industry
* Brand personality
* Color palette
* Typography
* Photography style
* Competitor overview

### UI

Card-based layout.

Sections:

Brand Overview

Visual Identity

Social Presence

Competitive Landscape

Creative Insights

---

## Feature 2: AI Moodboard Generator

Input:

Japanese-inspired luxury skincare brand

Output:

* Visual references
* Packaging inspiration
* Typography examples
* Photography direction
* Color systems
* Material references

Generated into a board.

---

## Feature 3: Infinite Canvas

Users can:

* Move cards
* Resize cards
* Delete cards
* Add notes
* Create sections

Canvas behaves similarly to:

* Milanote
* FigJam
* Figma Whiteboard

---

## Feature 4: Project Saving

Users can:

* Save boards
* Reopen boards
* Duplicate boards

---

## Feature 5: Export

Export:

* PDF
* PNG
* Presentation mode

---

# User Stories

As a designer

I want to audit a brand

So that I can quickly understand its visual identity.

As a founder

I want inspiration for my startup

So that I can create a cohesive brand direction.

As a student

I want references automatically collected

So that I can spend less time researching.

---

# Database Schema

## users

id

email

name

created_at

---

## projects

id

user_id

title

description

created_at

updated_at

---

## boards

id

project_id

name

canvas_state

created_at

---

## assets

id

project_id

type

title

url

source

metadata_json

created_at

---

## audit_results

id

project_id

summary

mission

positioning

tone

competitors

insights

created_at

---

## canvas_items

id

board_id

asset_id

x

y

width

height

rotation

notes

created_at

---

# Architecture

Frontend

Next.js 15

TypeScript

Tailwind

shadcn/ui

React Flow

TanStack Query

Backend

Supabase

Postgres

Storage

Authentication

OpenAI

Brand analysis

Summaries

Strategic insights

Image tagging

External Services

Brandfetch

SerpAPI

Apify

Unsplash

Pexels

---

# AI System

## Agent 1

Research Agent

Responsibilities

* Find company information
* Gather visual assets
* Find competitors

Output

Structured JSON

---

## Agent 2

Brand Strategist

Responsibilities

* Analyze positioning
* Analyze tone
* Generate opportunities

Output

Strategic report

---

## Agent 3

Moodboard Curator

Responsibilities

* Select references
* Group references
* Generate themes

Output

Moodboard structure

---

# AI Prompt Structure

System:

You are a senior brand strategist and creative director.

Analyze the provided company information.

Return:

* Positioning
* Audience
* Visual identity
* Competitive analysis
* Opportunities
* Creative recommendations

Format as structured JSON.

---

# Dashboard

Sections

Recent Projects

Saved Boards

Templates

New Audit

Search Bar

---

# Board Layout

Top

Project Header

Left Sidebar

Assets

Colors

Typography

Images

Notes

Center

Infinite Canvas

Right Sidebar

Project Insights

Brand Summary

Generated Recommendations

---

# V2 Features

Team Collaboration

Comments

Live Multiplayer

Share Links

Presentation Mode

Figma Plugin

Chrome Extension

---

# V3 Features

AI Creative Director

Generate:

* Logos
* Packaging
* Ad Concepts
* Campaign Directions
* Pitch Decks

Automatic competitor monitoring

Brand trend forecasting

---

# Success Metrics

Time to first board under 60 seconds

Board generation completion rate above 80%

Weekly retention above 30%

Average session length above 10 minutes

---

# Cursor Instructions

Generate a production-ready SaaS application.

Requirements:

* Next.js App Router
* TypeScript
* Tailwind
* shadcn/ui
* Supabase Auth
* Supabase Database
* React Flow canvas
* Responsive design
* Dark and Light modes
* Clean Apple-quality UI
* Strict TypeScript
* Server Actions where appropriate
* Modular architecture
* Component-driven design
* Vercel deployment ready

Build MVP completely before V2 features.
