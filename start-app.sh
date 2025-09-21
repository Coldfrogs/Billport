#!/bin/bash

echo "🚀 Starting Proof-of-Trade Full-Stack Application"
echo "================================================"

echo ""
echo "📋 Step 1: Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!

echo ""
echo "⏳ Waiting for backend to start..."
sleep 5

echo ""
echo "📋 Step 2: Opening Frontend in Browser..."
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3001
elif command -v open > /dev/null; then
    open http://localhost:3001
else
    echo "Please open http://localhost:3001 in your browser"
fi

echo ""
echo "✅ Application started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3001"
echo "📊 Backend API: http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop the application"

# Wait for user to stop
wait $BACKEND_PID
