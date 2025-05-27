# EchoSpace Deployment Guide

This guide will help you test and deploy your EchoSpace application, including the video calling feature.

## Local Testing

### 1. Start the Server

```bash
# Navigate to the server directory
cd server

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

The server will run on port 3001 by default.

### 2. Start the Frontend

In a new terminal:

```bash
# Navigate to the project root
cd ..

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will run on port 3000 by default.

### 3. Testing Video Calling

1. Open two different browsers (e.g., Chrome and Firefox) or use incognito mode
2. Navigate to `http://localhost:3000/rooms` in both browsers
3. Create a new room in one browser
4. Join the room from the other browser
5. Test the following features:
   - Audio mute/unmute
   - Video enable/disable
   - Screen sharing
   - Chat messaging
   - Participant list

## Production Deployment

### 1. Deploy the Server

#### Option 1: Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: ecotalk-server
   - **Root Directory**: server
   - **Runtime**: Node
   - **Build Command**: npm install
   - **Start Command**: node index.js
4. Add environment variables from `.env.production`
5. Deploy the service

#### Option 2: Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Configure the service:
   - **Root Directory**: server
   - **Start Command**: node index.js
4. Add environment variables from `.env.production`
5. Deploy the service

### 2. Deploy the Frontend to Netlify

1. Update `.env.production` with your deployed server URL
2. Commit and push your changes to GitHub
3. Log in to [Netlify](https://netlify.com)
4. Create a new site from Git
5. Connect your GitHub repository
6. Configure the build settings:
   - **Build Command**: npm run build
   - **Publish Directory**: out
7. Add environment variables from `.env.production`
8. Deploy the site

### 3. Update CORS Configuration

After deploying your frontend, update the `ALLOWED_ORIGINS` environment variable on your server to include your Netlify domain:

```
ALLOWED_ORIGINS=https://your-app.netlify.app,https://www.your-app.netlify.app
```

## Troubleshooting

### WebRTC Connection Issues

1. Check browser console for errors
2. Verify that your server is accessible from the client
3. Ensure CORS is properly configured
4. Check that your STUN/TURN servers are working

### Audio/Video Issues

1. Check browser permissions for camera and microphone
2. Verify that devices are properly connected
3. Try different browsers to isolate the issue

### Deployment Issues

1. Check server logs for errors
2. Verify environment variables are correctly set
3. Ensure your server is running and accessible
4. Check Netlify deploy logs for frontend issues

## Production Checklist

- [ ] Update all environment variables
- [ ] Test WebRTC connections in production
- [ ] Verify CORS configuration
- [ ] Test on multiple devices and browsers
- [ ] Monitor server performance
- [ ] Set up error logging
- [ ] Configure custom domain (optional)
