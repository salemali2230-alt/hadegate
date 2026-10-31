import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, AlertCircle, Sparkles } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      setIsInitializing(true);
      setCameraError(null);

      // Stop previous stream tracks if any
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('المتصفح لا يدعم الوصول للكاميرا مباشرة. يمكنك رفع صورة من جهازك.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });

        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError(
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'تم رفض إذن الكاميرا. يرجى السماح بالوصول للكاميرا من إعدادات المتصفح أو اختيار صورة من الملفات.'
            : 'تعذر تشغيل الكاميرا على هذا الجهاز. يمكنك رفع صورة النبات مباشرة من جهازك.'
        );
      } finally {
        setIsInitializing(false);
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop camera tracks
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    onCapture(dataUrl);
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between items-center p-4">
      {/* Top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10 text-white">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600/30 rounded-xl backdrop-blur-md border border-emerald-500/30">
            <Camera className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-base">كاميرا التعرف على النباتات</h3>
            <p className="text-xs text-stone-300">وجّه الكاميرا نحو الورقة، الزهرة، أو شكل النبات العام</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            onClose();
          }}
          className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 transition rounded-full text-white"
          title="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera Viewport */}
      <div className="relative w-full max-w-2xl flex-1 flex items-center justify-center my-4 overflow-hidden rounded-3xl border border-emerald-500/30 bg-stone-900 shadow-2xl">
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-300 z-10 bg-stone-900/80">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm">جاري تشغيل الكاميرا...</p>
          </div>
        )}

        {cameraError ? (
          <div className="p-6 text-center max-w-md bg-rose-950/40 border border-rose-600/40 rounded-2xl mx-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <p className="text-rose-200 text-sm mb-4 leading-relaxed">{cameraError}</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"
            >
              الرجوع واختيار صورة من جهازي
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle / Viewfinder */}
            <div className="absolute inset-8 sm:inset-14 border-2 border-dashed border-emerald-400/50 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg" />
                <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg" />
              </div>
              
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  ضع الورقة أو الزهرة في المركز
                </span>
              </div>

              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg" />
                <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom controls */}
      {!cameraError && (
        <div className="w-full max-w-2xl flex items-center justify-around py-2 z-10">
          {/* Switch Camera */}
          <button
            type="button"
            onClick={toggleCamera}
            className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition flex flex-col items-center gap-1"
            title="تبديل الكاميرا (أمامية / خلفية)"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-[10px] text-stone-300">تبديل</span>
          </button>

          {/* Shutter Button */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={isInitializing}
            className="w-20 h-20 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 active:scale-90 transition flex items-center justify-center shadow-lg shadow-emerald-500/30 group disabled:opacity-50"
            title="التقاط صورة النبات"
          >
            <div className="w-14 h-14 rounded-full bg-white group-hover:scale-105 transition" />
          </button>

          {/* Close / Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-stone-200 rounded-xl transition text-xs"
          >
            إلغاء
          </button>
        </div>
      )}
    </div>
  );
};
