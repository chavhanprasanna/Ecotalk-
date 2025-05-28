<<<<<<< HEAD
# EchoSpace - Anonymous Voice & Video Chat Platform

EchoSpace is a modern anonymous voice and video chat platform that enables real-time communication without the need for user accounts. It features a clean, intuitive interface and robust real-time communication capabilities.

## Features

- **Anonymous Communication**: Join rooms instantly without registration
- **Real-time Video & Audio**: High-quality WebRTC-based communication
- **Stable Connections**: Enhanced WebSocket reliability with automatic reconnection
- **Room System**: Create and join public/private rooms
- **Text Chat**: Real-time messaging within rooms
- **User Controls**: Mute/unmute audio/video, screen sharing
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Adaptive theme support
- **Connection Status**: Visual indicators for connection state

## Tech Stack

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS with shadcn/ui components
- Socket.IO for reliable real-time communication
- SimplePeer for WebRTC peer connections
- React Hook Form for form handling
- Zustand for state management
- Lucide React for icons

### Backend
- Node.js with Express
- Socket.IO with enhanced CORS support
- WebRTC signaling server
- STUN/TURN server integration for reliable connections

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chavhanprasanna/Ecotalk-.git
cd Ecotalk-
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately
npm run dev:client      # Frontend
npm run dev:server   # Backend
```

5. Open your browser and navigate to http://localhost:3000

## Deployment

### Frontend
The frontend can be deployed to Vercel or Netlify:

1. Create a new project on Vercel/Netlify
2. Connect your repository
3. Set the environment variables
4. Deploy

### Backend
The backend can be deployed to Render or Railway:

1. Create a new web service
2. Connect your repository
3. Set the build command to `npm install`
4. Set the start command to `node server/index.js`
5. Set the environment variables
6. Deploy

## WebRTC Configuration

The application uses multiple STUN servers for better connection reliability. You can customize the STUN/TURN servers in `lib/webrtc-utils.ts`:

```typescript
export const iceServers = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302'
      ]
    }
  ]
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
=======
# Ecotalk-
>>>>>>> 4d9e9365d6715e3d2d0a89e586ef7c5ac39e739b
