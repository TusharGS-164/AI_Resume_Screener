#!/bin/bash
cd "$(dirname "$0")"
echo "Installing npm dependencies..."
npm install
echo "Starting React dev server on http://localhost:5173"
npm run dev
