# CLAUDE.md - Project Guide

## Project Overview
Interactive game theory exploration about trust, built as a static HTML/JS web application.

## Running the Project
- Test locally using: `npx http-server` or [MAMP](https://www.mamp.info/en/)
- No build/compile steps required
- Open index.html in browser to run

## Structure
- `js/main.js`: Entry point
- `js/core/`: UI components
- `js/sims/`: Game simulations
- `js/slides/`: Content slides
- `words.html`: Text content (for translations)

## Code Style Guidelines
- Use tabs for indentation
- Prefer functional programming patterns
- CamelCase for variables/functions, PascalCase for classes
- Classes generally organized as self-contained components
- Event communication via publish/subscribe (minpubsub)
- Animations with PIXI.js and Tween.js
- Use ES5 syntax (no arrow functions, const/let)