/**
 * Generates a random ID for peer connections
 */
export const generatePeerId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Gets the user's display name from the browser if available
 */
export const getDisplayName = (): string => {
  if (typeof window === 'undefined') return 'Anonymous';
  
  // Try to get name from browser storage
  const savedName = localStorage.getItem('displayName');
  if (savedName) return savedName;
  
  // Generate a random name
  const randomName = `User-${Math.floor(Math.random() * 10000)}`;
  localStorage.setItem('displayName', randomName);
  return randomName;
};

/**
 * Gets the default ICE servers for WebRTC
 * You should replace these with your own STUN/TURN servers in production
 */
export const getDefaultIceServers = (): RTCIceServer[] => {
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // Add your TURN server configuration here if needed
  ];
};

/**
 * Creates a new RTCPeerConnection with default configuration
 */
export const createPeerConnection = (): RTCPeerConnection | null => {
  try {
    return new RTCPeerConnection({
      iceServers: getDefaultIceServers(),
      iceCandidatePoolSize: 10,
    });
  } catch (error) {
    console.error('Failed to create peer connection:', error);
    return null;
  }
};

/**
 * Creates a data channel with default configuration
 */
export const createDataChannel = (
  peerConnection: RTCPeerConnection,
  label: string,
  onMessage: (event: MessageEvent) => void
): RTCDataChannel | null => {
  try {
    const dataChannel = peerConnection.createDataChannel(label, {
      ordered: true,
      maxRetransmits: 3,
    });

    dataChannel.onmessage = onMessage;
    dataChannel.onopen = () => console.log('Data channel opened');
    dataChannel.onclose = () => console.log('Data channel closed');
    dataChannel.onerror = (error) => console.error('Data channel error:', error);

    return dataChannel;
  } catch (error) {
    console.error('Failed to create data channel:', error);
    return null;
  }
};

/**
 * Creates an offer with error handling
 */
export const createOffer = async (
  peerConnection: RTCPeerConnection
): Promise<RTCSessionDescriptionInit | null> => {
  try {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch (error) {
    console.error('Error creating offer:', error);
    return null;
  }
};

/**
 * Creates an answer with error handling
 */
export const createAnswer = async (
  peerConnection: RTCPeerConnection
): Promise<RTCSessionDescriptionInit | null> => {
  try {
    const answer = await peerConnection.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    
    await peerConnection.setLocalDescription(answer);
    return answer;
  } catch (error) {
    console.error('Error creating answer:', error);
    return null;
  }
};

/**
 * Handles setting remote description with error handling
 */
export const setRemoteDescription = async (
  peerConnection: RTCPeerConnection,
  description: RTCSessionDescriptionInit
): Promise<boolean> => {
  try {
    await peerConnection.setRemoteDescription(description);
    return true;
  } catch (error) {
    console.error('Error setting remote description:', error);
    return false;
  }
};

/**
 * Handles adding ICE candidate with error handling
 */
export const addIceCandidate = async (
  peerConnection: RTCPeerConnection,
  candidate: RTCIceCandidateInit | RTCIceCandidate
): Promise<boolean> => {
  try {
    await peerConnection.addIceCandidate(candidate);
    return true;
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
    return false;
  }
};
