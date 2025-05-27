import { useCallback, useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { useSocket } from '@/providers/socket-provider';

// Import adapter to ensure compatibility across browsers
import 'webrtc-adapter';

// Import types from our declaration file
import type { Instance as PeerInstance, SignalData, Options as PeerOptions } from 'simple-peer';

interface PeerState {
  [peerId: string]: {
    peer: PeerInstance;
    stream?: MediaStream;
  };
}

interface UseSimplePeerProps {
  roomId: string;
  localStream: MediaStream | null;
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (peerId: string) => void;
}

export const useSimplePeer = ({
  roomId,
  localStream,
  onRemoteStream,
  onRemoteStreamRemoved,
}: UseSimplePeerProps) => {
  const { socket, isConnected } = useSocket();
  const [peers, setPeers] = useState<PeerState>({});
  const peersRef = useRef<PeerState>({});

  // Create a peer connection
  const createPeer = useCallback(
    (peerId: string, initiator: boolean) => {
      if (!localStream) {
        console.warn('Cannot create peer without local stream');
        return null;
      }

      console.log(`Creating ${initiator ? 'initiator' : 'receiver'} peer for ${peerId}`);

      try {
        // Enhanced ICE servers configuration with TURN fallback
        const peerOptions: PeerOptions = {
          initiator,
          trickle: true,
          stream: localStream,
          sdpTransform: (sdp: string) => {
            // Prioritize VP8 codec for better compatibility
            return sdp.replace(/(m=video.*\r\n)/g, '$1c=IN IP4 0.0.0.0\r\n');
          },
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
              // Free TURN server for development (replace with your own in production)
              {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject',
              },
              {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject',
              },
            ],
            iceCandidatePoolSize: 10,
          },
        };
        
        const peer = SimplePeer(peerOptions);

        // Handle signals
        peer.on('signal', (data: SignalData) => {
          console.log(`Signal generated for ${peerId}:`, data.type || 'candidate');
          if (socket && isConnected) {
            socket.emit('signal', {
              roomId,
              to: peerId,
              from: socket.id,
              signal: data,
            });
          } else {
            console.warn('Cannot send signal: socket not connected');
          }
        });

        // Handle stream
        peer.on('stream', (stream: MediaStream) => {
          console.log(`Received stream from ${peerId}`, stream.getTracks().map(t => `${t.kind}:${t.enabled}`));
          
          // Store stream in peer state
          peersRef.current[peerId] = { 
            ...peersRef.current[peerId],
            stream 
          };
          
          setPeers(prevPeers => ({
            ...prevPeers,
            [peerId]: { 
              ...prevPeers[peerId],
              stream 
            },
          }));
          
          // Notify parent component
          onRemoteStream(peerId, stream);
        });

        // Handle errors
        peer.on('error', (err: Error) => {
          console.error(`Peer error with ${peerId}:`, err);
          
          // Don't immediately clean up on all errors
          // Some errors are recoverable
          if (err.message.includes('Connection failed') || 
              err.message.includes('Ice connection failed')) {
            console.log(`Connection failed with ${peerId}, attempting to reconnect...`);
            // Try to recreate the peer after a short delay
            setTimeout(() => {
              if (peersRef.current[peerId]) {
                cleanupPeer(peerId);
                addPeer(peerId, true);
              }
            }, 2000);
          } else {
            cleanupPeer(peerId);
          }
        });

        // Handle close
        peer.on('close', () => {
          console.log(`Peer connection with ${peerId} closed`);
          cleanupPeer(peerId);
        });
        
        // Handle connection state changes
        peer.on('connect', () => {
          console.log(`Peer connection established with ${peerId}`);
        });
        
        // Handle ICE connection state changes (not directly exposed by simple-peer)
        const rawPeer = peer as any;
        if (rawPeer._pc) {
          rawPeer._pc.oniceconnectionstatechange = () => {
            const state = rawPeer._pc.iceConnectionState;
            console.log(`ICE connection state with ${peerId}: ${state}`);
            
            if (state === 'connected' || state === 'completed') {
              console.log(`WebRTC connection fully established with ${peerId}`);
            }
          };
        }

        return peer;
      } catch (error) {
        console.error('Error creating peer:', error);
        return null;
      }
    },
    [localStream, onRemoteStream, roomId, socket]
  );

  // Add a peer
  const addPeer = useCallback(
    (peerId: string, initiator: boolean) => {
      // Don't create duplicate peers
      if (peersRef.current[peerId]) {
        console.log(`Peer ${peerId} already exists`);
        return;
      }

      const peer = createPeer(peerId, initiator);
      if (!peer) return;

      // Store the peer
      peersRef.current[peerId] = { peer };
      setPeers((prevPeers) => ({
        ...prevPeers,
        [peerId]: { peer },
      }));

      return peer;
    },
    [createPeer]
  );

  // Handle incoming signal
  const handleSignal = useCallback(
    (data: { from: string; signal: SignalData }) => {
      const { from, signal } = data;
      console.log(`Received signal from ${from}:`, signal.type || 'candidate');

      // If we don't have this peer yet and it's an offer, create a new peer
      if (!peersRef.current[from] && signal.type === 'offer') {
        console.log(`Creating new peer for ${from} from offer`);
        const peer = addPeer(from, false);
        if (peer) {
          try {
            peer.signal(signal);
            console.log(`Processed offer from ${from}`);
          } catch (error) {
            console.error(`Error processing offer from ${from}:`, error);
          }
        } else {
          console.error(`Failed to create peer for ${from}`);
        }
        return;
      }

      // If we have this peer, pass the signal
      if (peersRef.current[from]) {
        try {
          peersRef.current[from].peer.signal(signal);
          
          // Log signal processing
          if (signal.type === 'answer') {
            console.log(`Processed answer from ${from}`);
          } else if (!signal.type) {
            console.log(`Processed ICE candidate from ${from}`);
          }
        } catch (error) {
          console.error(`Error signaling to peer ${from}:`, error);
          // Don't immediately clean up on all errors
          if (error instanceof Error && error.message.includes('cannot signal after peer is destroyed')) {
            cleanupPeer(from);
          }
        }
      } else {
        console.warn(`Received signal for unknown peer ${from}`);
        
        // If it's not an offer but we don't have the peer, request a new offer
        // This can happen if the peer was cleaned up but the other side doesn't know yet
        if (signal.type !== 'offer' && socket && isConnected) {
          console.log(`Requesting new offer from ${from}`);
          socket.emit('request-offer', { roomId, to: from });
        }
      }
    },
    [addPeer]
  );

  // Clean up a peer
  const cleanupPeer = useCallback(
    (peerId: string) => {
      if (!peersRef.current[peerId]) {
        console.log(`No peer to clean up for ${peerId}`);
        return;
      }

      console.log(`Cleaning up peer connection with ${peerId}`);
      
      try {
        // Close the peer connection
        peersRef.current[peerId].peer.destroy();
      } catch (e) {
        console.error(`Error destroying peer ${peerId}:`, e);
      }

      // Remove from state
      delete peersRef.current[peerId];
      setPeers((prevPeers) => {
        const newPeers = { ...prevPeers };
        delete newPeers[peerId];
        return newPeers;
      });

      // Notify parent
      onRemoteStreamRemoved(peerId);
    },
    [onRemoteStreamRemoved]
  );

  // Initialize peers when a user joins
  const initializePeers = useCallback(
    (participants: string[]) => {
      console.log('Initializing peers for participants:', participants);
      
      // Create initiator peers for each participant
      participants.forEach((participantId) => {
        if (participantId !== socket?.id) {
          addPeer(participantId, true);
        }
      });
    },
    [addPeer, socket?.id]
  );

  // Clean up all peers
  const cleanupAllPeers = useCallback(() => {
    console.log('Cleaning up all peers');
    
    Object.keys(peersRef.current).forEach((peerId) => {
      cleanupPeer(peerId);
    });
  }, [cleanupPeer]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('Setting up socket listeners for WebRTC signaling');

    // Handle signals
    socket.on('signal', handleSignal);

    // Handle user joined - we'll initiate a connection to them
    socket.on('user-joined', (data: { userId: string; user: any; participants: string[] }) => {
      console.log('User joined:', data.userId, data.user?.name || 'Unknown user');
      
      if (data.userId !== socket.id && localStream) {
        // Wait a short time to make sure the other peer is ready to receive signals
        setTimeout(() => {
          console.log(`Initiating connection to ${data.userId}`);
          addPeer(data.userId, true);
        }, 1000);
      }
    });
    
    // Handle request for new offer
    socket.on('request-offer', (data: { from: string }) => {
      console.log(`Received request for new offer from ${data.from}`);
      if (data.from !== socket.id && localStream) {
        // Clean up any existing peer first
        cleanupPeer(data.from);
        // Create a new peer as initiator
        addPeer(data.from, true);
      }
    });

    // Handle user left
    socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      cleanupPeer(userId);
    });

    // Handle room state - initialize connections to existing participants
    socket.on('room-state', (data: { participants: any[] }) => {
      console.log('Room state received with participants:', 
        data.participants.map(p => p.name || p.id).join(', '));
      
      // Extract participant IDs for WebRTC connections
      const participantIds = data.participants
        .filter(p => p.id !== socket.id) // Filter out self
        .map(p => p.id);
      
      // Initialize peers with a slight delay to ensure room join is complete
      setTimeout(() => {
        initializePeers(participantIds);
      }, 1000);
    });

    // Clean up
    return () => {
      socket.off('signal', handleSignal);
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('room-state');
      socket.off('request-offer');
      cleanupAllPeers();
    };
  }, [
    socket,
    isConnected,
    handleSignal,
    addPeer,
    cleanupPeer,
    initializePeers,
    cleanupAllPeers,
    localStream,
  ]);

  // Clean up all peers when component unmounts
  useEffect(() => {
    return () => {
      cleanupAllPeers();
    };
  }, [cleanupAllPeers]);

  return {
    peers: Object.keys(peers).map((id) => ({
      id,
      peer: peers[id].peer,
      stream: peers[id].stream,
    })),
    cleanupPeer,
  };
};
