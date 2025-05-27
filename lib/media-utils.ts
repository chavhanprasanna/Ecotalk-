/**
 * Gets user media with error handling
 */
export const getUserMedia = async (
  constraints: MediaStreamConstraints
): Promise<MediaStream | null> => {
  try {
    // Check if running in a browser environment
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Media devices not available in this environment');
    }

    // Check if permissions are granted
    const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
    if (permissions.state === 'denied') {
      throw new Error('Camera permission denied');
    }

    // Request media stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Check if we actually got the requested tracks
    if (constraints.audio && stream.getAudioTracks().length === 0) {
      console.warn('No audio track was found in the stream');
    }
    if (constraints.video && stream.getVideoTracks().length === 0) {
      console.warn('No video track was found in the stream');
    }
    
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    
    // Provide more specific error messages
    const errorMessage = (() => {
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          return 'Permission to access camera/microphone was denied';
        } else if (error.name === 'NotFoundError') {
          return 'No media tracks of the specified type were found';
        } else if (error.name === 'NotReadableError') {
          return 'Hardware error occurred at the operating system or browser level';
        } else if (error.name === 'OverconstrainedError') {
          return 'Could not satisfy the requested constraints';
        } else if (error.name === 'SecurityError') {
          return 'User media support is disabled';
        }
      }
      return error instanceof Error ? error.message : 'Unknown error occurred';
    })();
    
    throw new Error(`Failed to access media devices: ${errorMessage}`);
  }
};

/**
 * Gets display media (screen sharing) with error handling
 */
export const getDisplayMedia = async (): Promise<MediaStream | null> => {
  try {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Media devices not available in this environment');
    }

    // @ts-ignore - TypeScript doesn't know about getDisplayMedia yet
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: { ideal: 30, max: 60 },
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
      },
      audio: false,
      // @ts-ignore - Experimental
      selfBrowserSurface: 'exclude',
      // @ts-ignore - Experimental
      surfaceSwitching: 'exclude',
    });

    // Handle when user stops sharing
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        console.log('Screen sharing ended by user');
      };
    }

    return stream;
  } catch (error) {
    console.error('Error accessing display media:', error);
    throw error;
  }
};

/**
 * Stops all tracks in a media stream
 */
export const stopMediaStream = (stream: MediaStream | null) => {
  if (!stream) return;
  
  stream.getTracks().forEach(track => {
    track.stop();
  });
};

/**
 * Toggles a media track (mute/unmute)
 */
export const toggleMediaTrack = (
  stream: MediaStream | null, 
  kind: 'audio' | 'video', 
  enabled: boolean
): boolean => {
  if (!stream) return false;
  
  const tracks = kind === 'audio' 
    ? stream.getAudioTracks() 
    : stream.getVideoTracks();
  
  if (tracks.length === 0) return false;
  
  tracks[0].enabled = enabled;
  return enabled;
};

/**
 * Gets the current camera and microphone devices
 */
export const getMediaDevices = async (): Promise<{
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
}> => {
  try {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return { audioInputs: [], videoInputs: [], audioOutputs: [] };
    }

    // Request permission to list devices
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    return {
      audioInputs: devices.filter(device => device.kind === 'audioinput'),
      videoInputs: devices.filter(device => device.kind === 'videoinput'),
      audioOutputs: devices.filter(device => device.kind === 'audiooutput'),
    };
  } catch (error) {
    console.error('Error getting media devices:', error);
    return { audioInputs: [], videoInputs: [], audioOutputs: [] };
  }
};

/**
 * Switches the camera source
 */
export const switchCamera = async (
  currentStream: MediaStream | null,
  deviceId: string
): Promise<MediaStream | null> => {
  if (!currentStream) return null;
  
  try {
    // Stop current video tracks
    currentStream.getVideoTracks().forEach(track => track.stop());
    
    // Get new video stream
    const newStream = await getUserMedia({
      video: { 
        deviceId: { exact: deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: false,
    });
    
    if (!newStream) return null;
    
    // Add the new video track to the existing stream
    const videoTrack = newStream.getVideoTracks()[0];
    if (videoTrack) {
      currentStream.addTrack(videoTrack);
    }
    
    return currentStream;
  } catch (error) {
    console.error('Error switching camera:', error);
    return null;
  }
};
