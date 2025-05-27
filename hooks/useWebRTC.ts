import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/providers/socket-provider';

interface WebRTCHookProps {
  roomId: string;
  localStream: MediaStream | null;
  onRemoteStream: (userId: string, stream: MediaStream) => void;
  onRemoteStreamRemoved: (userId: string) => void;
}

export const useWebRTC = ({
  roomId,
  localStream,
  onRemoteStream,
  onRemoteStreamRemoved,
}: WebRTCHookProps) => {
  const { socket, isConnected } = useSocket();
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);

  // Get ICE servers (you can replace this with your own STUN/TURN servers)
  useEffect(() => {
    const getIceServers = async () => {
      try {
        // You can use public STUN servers or your own TURN server
        const servers: RTCIceServer[] = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          // Add your TURN server configuration here if needed
        ];
        
        setIceServers(servers);
      } catch (error) {
        console.error('Error getting ICE servers:', error);
      }
    };

    getIceServers();
  }, []);

  // Create a new peer connection
  const createPeerConnection = useCallback((userId: string) => {
    if (!socket || !localStream) return null;

    try {
      console.log(`Creating peer connection for user: ${userId}`);
      
      const peerConnection = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10,
      });

      // Add local stream tracks to the connection
      localStream.getTracks().forEach((track) => {
        if (peerConnection.addTrack && track) {
          peerConnection.addTrack(track, localStream);
        }
      });

      // When remote adds a stream to the connection
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream');
        if (event.streams && event.streams[0]) {
          onRemoteStream(userId, event.streams[0]);
        }
      };

      // ICE candidate handling
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          socket.emit('ice-candidate', {
            roomId,
            to: userId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state: ${peerConnection.iceConnectionState}`);
        
        if (peerConnection.iceConnectionState === 'failed' || 
            peerConnection.iceConnectionState === 'disconnected' ||
            peerConnection.iceConnectionState === 'closed') {
          console.log(`Connection with ${userId} closed or failed`);
          cleanupPeerConnection(userId);
        }
      };

      peerConnections.current[userId] = peerConnection;
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  }, [socket, localStream, iceServers, roomId, onRemoteStream]);

  // Clean up a peer connection
  const cleanupPeerConnection = useCallback((userId: string) => {
    if (peerConnections.current[userId]) {
      console.log(`Cleaning up peer connection for user: ${userId}`);
      
      // Close the connection
      if (peerConnections.current[userId].connectionState !== 'closed') {
        peerConnections.current[userId].close();
      }
      
      // Remove from our connections
      delete peerConnections.current[userId];
      
      // Notify parent component
      onRemoteStreamRemoved(userId);
    }
  }, [onRemoteStreamRemoved]);

  // Handle incoming call
  const handleIncomingCall = useCallback(async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
    if (!socket || !localStream) return;
    
    const { from, offer } = data;
    console.log(`Incoming call from ${from}`);
    
    try {
      const peerConnection = createPeerConnection(from);
      if (!peerConnection) throw new Error('Failed to create peer connection');
      
      // Set remote description
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // Send answer back to the caller
      socket.emit('answer', {
        roomId,
        to: from,
        answer: peerConnection.localDescription,
      });
      
    } catch (error) {
      console.error('Error handling incoming call:', error);
      cleanupPeerConnection(from);
    }
  }, [socket, localStream, roomId, createPeerConnection, cleanupPeerConnection]);

  // Handle answer
  const handleAnswer = useCallback(async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
    const { from, answer } = data;
    const peerConnection = peerConnections.current[from];
    
    if (peerConnection && peerConnection.signalingState !== 'stable') {
      console.log(`Received answer from ${from}`);
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error setting remote description:', error);
        cleanupPeerConnection(from);
      }
    }
  }, [cleanupPeerConnection]);

  // Handle ICE candidate
  const handleIceCandidate = useCallback((data: { from: string; candidate: RTCIceCandidateInit }) => {
    const { from, candidate } = data;
    const peerConnection = peerConnections.current[from];
    
    if (peerConnection && candidate) {
      console.log(`Received ICE candidate from ${from}`);
      try {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }, []);

  // Initiate a call
  const initiateCall = useCallback(async (userId: string) => {
    if (!socket || !localStream) return;
    
    try {
      console.log(`Initiating call with ${userId}`);
      const peerConnection = createPeerConnection(userId);
      if (!peerConnection) throw new Error('Failed to create peer connection');
      
      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await peerConnection.setLocalDescription(offer);
      
      // Send offer to the other peer
      socket.emit('offer', {
        roomId,
        to: userId,
        offer: peerConnection.localDescription,
      });
      
    } catch (error) {
      console.error('Error initiating call:', error);
      cleanupPeerConnection(userId);
    }
  }, [socket, localStream, roomId, createPeerConnection, cleanupPeerConnection]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('offer', handleIncomingCall);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('offer', handleIncomingCall);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [socket, handleIncomingCall, handleAnswer, handleIceCandidate]);

  // Clean up all peer connections on unmount
  useEffect(() => {
    return () => {
      Object.keys(peerConnections.current).forEach(userId => {
        cleanupPeerConnection(userId);
      });
    };
  }, [cleanupPeerConnection]);

  return {
    initiateCall,
    cleanupPeerConnection,
  };
};
