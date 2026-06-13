import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, VideoOff } from 'lucide-react';

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Initialize camera stream
  const startCamera = async () => {
    setError(null);
    setIsCameraReady(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: 'environment', // prefer back camera on mobiles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error('Webcam Access Error:', err);
      setError('Could not access camera. Please verify camera permissions or select file upload.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Clean up webcam stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture current frame
  const captureFrame = () => {
    if (!videoRef.current || !isCameraReady) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Set matching dimensions
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    // Mirror draw if using front camera (optional, default standard draw)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `cam-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center">
        {error ? (
          <div className="px-6 text-center text-slate-400">
            <VideoOff className="h-12 w-12 text-rose-500 mx-auto mb-3" />
            <p className="text-sm font-medium mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-2 animate-spin-hover" />
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCameraReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            {/* Viewfinder Guideline Overlays */}
            {isCameraReady && (
              <div className="absolute inset-0 border-[3px] border-dashed border-white/20 pointer-events-none m-6 rounded-xl flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-2 border-white/30 border-dotted" />
              </div>
            )}

            {!isCameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mb-2" />
                <p className="text-xs">Warming up webcam...</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="w-full bg-slate-950 p-4 flex items-center justify-between px-6">
        <button
          onClick={onCancel}
          className="text-sm font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={captureFrame}
          disabled={!isCameraReady}
          className={`h-16 w-16 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-lg transition-all ${
            isCameraReady 
              ? 'bg-rose-600 hover:bg-rose-500 active:scale-95' 
              : 'bg-slate-800 cursor-not-allowed opacity-50'
          }`}
          aria-label="Capture photo"
        >
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
            <Camera className="h-5 w-5 text-slate-950" />
          </div>
        </button>

        <button
          onClick={startCamera}
          disabled={error}
          className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Switch / Restart Camera"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
