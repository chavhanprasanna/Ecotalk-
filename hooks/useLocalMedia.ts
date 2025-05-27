import { useState, useEffect, useCallback } from 'react';

export const useLocalMedia = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Request access to user's media devices
  const getLocalStream = useCallback(async (audio = true, video = true) => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop any existing tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Request new media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user',
        } : false,
      });

      setLocalStream(stream);
      setAudioEnabled(audio);
      setVideoEnabled(video);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError(err instanceof Error ? err : new Error('Failed to access media devices'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    if (!localStream) return;
    
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const newState = !audioEnabled;
      audioTracks[0].enabled = newState;
      setAudioEnabled(newState);
      return newState;
    }
    
    // If no audio track exists, request a new one
    await getLocalStream(true, videoEnabled);
    return true;
  }, [localStream, audioEnabled, videoEnabled, getLocalStream]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    try {
      if (!localStream) return false;
      
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        // If we already have video tracks, just toggle their enabled state
        const newState = !videoEnabled;
        videoTracks[0].enabled = newState;
        setVideoEnabled(newState);
        return newState;
      }
      
      // If no video track exists, request a new one
      // First stop any existing tracks to release devices
      if (localStream) {
        // Only stop video tracks, keep audio tracks
        localStream.getVideoTracks().forEach(track => track.stop());
      }
      
      // Request camera with a small delay to ensure previous resources are released
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Request new media stream with video
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
        },
        audio: false, // Don't request audio again, we'll merge streams
      });
      
      // Add the video track to the existing stream
      if (stream && stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        
        // If we have an existing stream, add the track to it
        if (localStream) {
          // Remove any existing video tracks first
          localStream.getVideoTracks().forEach(track => {
            localStream.removeTrack(track);
            track.stop();
          });
          
          // Add the new video track
          localStream.addTrack(videoTrack);
        }
        
        setVideoEnabled(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error toggling video:', error);
      
      // If we get a NotReadableError (device in use), try again after a longer delay
      if (error instanceof DOMException && error.name === 'NotReadableError') {
        // Show a more helpful error message
        console.warn('Camera is in use by another application or tab. Trying again in 1 second...');
        
        // Try again after a longer delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          // Request with different constraints
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true, // Use default constraints
            audio: false,
          });
          
          if (stream && stream.getVideoTracks().length > 0) {
            const videoTrack = stream.getVideoTracks()[0];
            
            if (localStream) {
              localStream.getVideoTracks().forEach(track => {
                localStream.removeTrack(track);
                track.stop();
              });
              
              localStream.addTrack(videoTrack);
            }
            
            setVideoEnabled(true);
            return true;
          }
        } catch (retryError) {
          console.error('Error on retry:', retryError);
        }
      }
      
      return false;
    }
  }, [localStream, videoEnabled, audioEnabled]);

  // Stop all tracks and clean up
  const stopAllTracks = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }
  }, [localStream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, [stopAllTracks]);

  return {
    localStream,
    isLoading,
    error,
    audioEnabled,
    videoEnabled,
    getLocalStream,
    toggleAudio,
    toggleVideo,
    stopAllTracks,
  };
};
