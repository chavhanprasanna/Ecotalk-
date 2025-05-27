# EchoSpace - Anonymous Voice & Video Chat Platform

EchoSpace is an open-source platform for anonymous voice and video chat, inspired by Free4Talk with a modern UI design. The platform allows users to join conversation rooms instantly with no login required, connecting with people around the world through voice, video, and text.

## Features

- **Fully Anonymous**: No login, no accounts, no tracking - just join and start chatting
- **Nickname & Avatar Generator**: Automatic generation of user identities
- **Room System**: Public/private rooms with categories and language tags
- **Room Discovery**: Search and filter room list by name, category, or language
- **Real-time Audio/Video**: WebRTC-based communication
- **In-room Text Chat**: Persistent chat during your session
- **Admin Controls**: Kick/mute/ban based on session ID
- **Room Lobby UI**: Avatars with mute/speaking status indicators
- **Responsive Design**: Mobile-friendly interface with dark/light mode

## Tech Stack

### Frontend
- Next.js with TypeScript
- Tailwind CSS with shadcn/ui components
- socket.io-client for real-time communication
- WebRTC for peer-to-peer audio/video streaming
- Zustand for state management
- lucide-react for icons

### Backend
- Node.js with Express
- Socket.io for signaling and room state
- WebRTC signaling server

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/echospace.git
cd echospace
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
# Run both frontend and backend concurrently
npm run dev:all

# Or run them separately
npm run dev      # Frontend
npm run server   # Backend
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

The application uses free STUN servers from Google. If you want to add custom STUN/TURN servers, modify the `getIceServers` function in `lib/utils.ts`:

```typescript
export function getIceServers() {
  return {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          // Add your TURN servers here
        ],
      },
    ],
  };
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.