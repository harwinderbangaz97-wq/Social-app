import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Video,
  X,
  RotateCcw,
  Check,
  Zap,
  ZapOff,
  SwitchCamera,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaPickerResult } from '../services/mediaPickerService';

export interface DeviceCameraModalProps {
  isOpen: boolean;
  mode: 'photo' | 'video';
  facingMode?: 'user' | 'environment';
  title?: string;
  onCapture: (result: MediaPickerResult) => void;
  onCancel: () => void;
}

export const DeviceCameraModal: React.FC<DeviceCameraModalProps> = ({
  isOpen,
  mode,
  facingMode: initialFacingMode = 'environment',
  title,
  onCapture,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>(initialFacingMode);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);

  // Review stage after capture
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedVideoUrl, setCapturedVideoUrl] = useState<string | null>(null);
  const [capturedVideoBlob, setCapturedVideoBlob] = useState<Blob | null>(null);

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Initialize or flip camera stream
  const startCameraStream = useCallback(async (facing: 'user' | 'environment') => {
    setHasPermissionError(false);
    setErrorMessage('');

    // Stop existing tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported in this browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1440 },
        },
        audio: mode === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      setHasPermissionError(true);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was blocked by your browser. Please allow camera permissions to take live photos or videos.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera hardware was detected on your device.');
      } else {
        setErrorMessage(err.message || 'Could not start camera.');
      }
    }
  }, [mode]);

  // Clean up tracks when closing
  const stopAllTracks = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCapturedPhotoUrl(null);
      setCapturedFile(null);
      setCapturedVideoUrl(null);
      setCapturedVideoBlob(null);
      setIsRecording(false);
      setRecordingSeconds(0);
      startCameraStream(currentFacingMode);
    } else {
      stopAllTracks();
    }

    return () => {
      stopAllTracks();
    };
  }, [isOpen, currentFacingMode, startCameraStream, stopAllTracks]);

  // Toggle Front / Back Camera
  const handleFlipCamera = () => {
    const nextFacing = currentFacingMode === 'user' ? 'environment' : 'user';
    setCurrentFacingMode(nextFacing);
  };

  // Take Snapshot Photo
  const handleShutterPhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (flashEnabled) {
      setIsCapturingFlash(true);
      setTimeout(() => setIsCapturingFlash(false), 200);
    }

    // Mirror image if user camera
    if (currentFacingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhotoUrl(dataUrl);

    // Convert to real File object
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedFile(file);
      }
    }, 'image/jpeg', 0.92);
  };

  // Start Video Recording
  const handleStartVideoRecording = () => {
    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      const supportedType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(mediaStreamRef.current, supportedType ? { mimeType: supportedType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blobType = supportedType || 'video/mp4';
        const blob = new Blob(recordedChunksRef.current, { type: blobType });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedVideoUrl(videoUrl);
        setCapturedVideoBlob(blob);
      };

      recorder.start(250);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            handleStopVideoRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder error:', err);
    }
  };

  // Stop Video Recording
  const handleStopVideoRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Retake
  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setCapturedFile(null);
    if (capturedVideoUrl) {
      URL.revokeObjectURL(capturedVideoUrl);
    }
    setCapturedVideoUrl(null);
    setCapturedVideoBlob(null);
    setRecordingSeconds(0);
    startCameraStream(currentFacingMode);
  };

  // Confirm and Use Captured Media
  const handleConfirmMedia = () => {
    if (mode === 'photo' && capturedPhotoUrl) {
      const file =
        capturedFile ||
        new File([new Blob()], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

      stopAllTracks();
      onCapture({
        url: capturedPhotoUrl,
        file,
        isVideo: false,
        name: file.name,
        size: file.size || capturedPhotoUrl.length,
        type: 'image/jpeg',
      });
    } else if (mode === 'video' && capturedVideoUrl && capturedVideoBlob) {
      const file = new File([capturedVideoBlob], `video_${Date.now()}.mp4`, {
        type: capturedVideoBlob.type || 'video/mp4',
      });

      stopAllTracks();
      onCapture({
        url: capturedVideoUrl,
        file,
        isVideo: true,
        name: file.name,
        size: capturedVideoBlob.size,
        type: capturedVideoBlob.type || 'video/mp4',
      });
    }
  };

  // Fallback direct input click when hardware/webrtc camera is denied
  const handleFallbackFileClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mode === 'photo' ? 'image/*' : 'video/*';
    input.capture = currentFacingMode;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            stopAllTracks();
            onCapture({
              url: reader.result,
              file,
              isVideo,
              name: file.name,
              size: file.size,
              type: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div
      id="device-camera-modal"
      className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-between select-none"
    >
      {/* Screen Flash Simulation */}
      {isCapturingFlash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Top Controls Bar */}
      <div className="w-full max-w-lg px-4 py-3 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              stopAllTracks();
              onCancel();
            }}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition cursor-pointer"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-white tracking-wide font-['Outfit'] drop-shadow-md">
            {title || (mode === 'photo' ? 'Take Photo' : 'Record Video')}
          </span>
        </div>

        {/* Top Camera Actions (Flash & Flip) */}
        {!capturedPhotoUrl && !capturedVideoUrl && (
          <div className="flex items-center gap-2">
            {mode === 'photo' && (
              <button
                type="button"
                onClick={() => setFlashEnabled(!flashEnabled)}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition cursor-pointer ${
                  flashEnabled ? 'bg-amber-400 text-slate-900 shadow-lg' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title={flashEnabled ? 'Flash On' : 'Flash Off'}
              >
                {flashEnabled ? <Zap className="w-4 h-4 fill-slate-900" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleFlipCamera}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition cursor-pointer"
              title="Flip camera (Front / Back)"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Camera Viewfinder / Preview Stage */}
      <div className="relative flex-1 w-full max-w-lg overflow-hidden flex items-center justify-center bg-slate-950">
        {hasPermissionError ? (
          <div className="p-6 text-center text-white max-w-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold font-['Outfit']">Camera Access Required</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {errorMessage}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => startCameraStream(currentFacingMode)}
                className="w-full h-11 rounded-full bg-[#5B9DFF] text-white font-bold text-xs hover:bg-blue-600 transition"
              >
                Retry Camera Access
              </button>
              <button
                type="button"
                onClick={handleFallbackFileClick}
                className="w-full h-10 rounded-full bg-white/20 text-white font-semibold text-xs hover:bg-white/30 transition"
              >
                Choose from Device Files
              </button>
            </div>
          </div>
        ) : capturedPhotoUrl ? (
          /* Captured Photo Preview Stage */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedPhotoUrl}
              alt="Captured Frame"
              className="w-full h-full object-contain"
            />
          </div>
        ) : capturedVideoUrl ? (
          /* Captured Video Preview Stage */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              src={capturedVideoUrl}
              autoPlay
              loop
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          /* Live Viewfinder Video */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${currentFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Viewfinder Rule-of-Thirds Grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Live Recording Indicator & Timer */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg backdrop-blur-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>REC 0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds} / 1:00</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Shutter / Review Control Center */}
      <div className="w-full max-w-lg px-6 py-6 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-around z-20">
        {capturedPhotoUrl || capturedVideoUrl ? (
          /* Review Controls (Retake vs Use) */
          <div className="w-full flex items-center justify-between gap-4">
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleRetake}
              className="flex-1 h-12 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/30 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleConfirmMedia}
              className="flex-1 h-12 rounded-full bg-[#5B9DFF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{mode === 'photo' ? 'Use Photo' : 'Use Video'}</span>
            </motion.button>
          </div>
        ) : mode === 'photo' ? (
          /* Photo Shutter Trigger */
          <div className="w-full flex items-center justify-center relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              disabled={hasPermissionError}
              onClick={handleShutterPhoto}
              aria-label="Capture Photo"
              className="w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center cursor-pointer shadow-xl disabled:opacity-40"
            >
              <div className="w-full h-full rounded-full bg-white active:bg-slate-200 transition-colors shadow-inner" />
            </motion.button>
          </div>
        ) : (
          /* Video Record Trigger */
          <div className="w-full flex items-center justify-center relative">
            {isRecording ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleStopVideoRecording}
                aria-label="Stop Recording"
                className="w-20 h-20 rounded-full border-4 border-rose-500 p-1.5 flex items-center justify-center cursor-pointer shadow-xl animate-pulse"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500 shadow-md" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                disabled={hasPermissionError}
                onClick={handleStartVideoRecording}
                aria-label="Start Recording"
                className="w-20 h-20 rounded-full border-4 border-white p-1.5 flex items-center justify-center cursor-pointer shadow-xl disabled:opacity-40"
              >
                <div className="w-full h-full rounded-full bg-rose-600 active:bg-rose-700 transition-colors shadow-inner" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
