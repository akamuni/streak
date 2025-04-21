# Streaker PWA

A Progressive Web App built with React + TypeScript and Firebase backend.

## Overview

This PWA supports:
- User authentication (Firebase Auth)
- Real-time data sync (Cloud Firestore) with offline support
- CRUD operations for tasks/notes
- File uploads
- Offline caching of assets and API responses
- Background sync for failed requests
- Push notifications via Firebase Cloud Messaging (FCM)

## Tech Stack

- Front‑end: React with TypeScript
- Backend services: Firebase Auth, Cloud Firestore, Firebase Hosting
- PWA: service worker, Workbox (caching & background sync)
- CI/CD: TBD (GitHub Actions recommended)

## Prerequisites

- Node.js ≥14 and npm (or yarn)
- Firebase CLI (`npm install -g firebase-tools`)
- Code editor (e.g. VS Code)

## Setup

1. Clone repo and install deps:
   ```bash
   git clone <repo-url>
   cd streaker
   npm install

   firebase login
   firebase init
   # Select: Hosting, Firestore, Authnpm run build
   firebase deploy