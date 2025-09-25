"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CameraComponentProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

// Utility to safely stop a stream
function hardStopStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {}
  });
}

export function CameraComponent({ onCapture, onClose }: CameraComponentProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);
  const unmountedRef = useRef(false);

  // State
  const [status, setStatus] = useState<
    "initial" | "starting" | "ready" | "stopped" | "error"
  >("initial");
  const [error, setError] = useState<string | null>(null);

  // Core start logic (idempotent)
  const startCamera = useCallback(async () => {
    if (unmountedRef.current) return;
    if (startingRef.current) return; // prevent parallel starts
    if (streamRef.current) return; // already started

    startingRef.current = true;
    setStatus("starting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (unmountedRef.current) {
        hardStopStream(stream); // acquired after unmount -> stop immediately
        return;
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // Single event handler path
        const handleCanPlay = () => {
          if (unmountedRef.current) return;
          setStatus("ready");
          video.removeEventListener("canplay", handleCanPlay);
        };
        video.addEventListener("canplay", handleCanPlay);
        try {
          await video.play();
        } catch {
          /* Safari might block until user gesture; canplay will still fire */
        }
      }
    } catch (err: any) {
      if (!unmountedRef.current) {
        setError("Unable to access camera. Grant permission and retry.");
        setStatus("error");
      }
    } finally {
      startingRef.current = false;
    }
  }, []);

  const teardown = useCallback(
    (reason?: string) => {
      if (unmountedRef.current) return; // avoid state after unmount
      // Mark stopped first for instantaneous UI feedback
      setStatus("stopped");

      const stream = streamRef.current;
      if (stream) {
        hardStopStream(stream);
        streamRef.current = null;
      }

      const video = videoRef.current;
      if (video) {
        try {
          video.pause();
          // Clearing srcObject first; then remove attribute for certain browsers
          (video as any).srcObject = null;
          video.removeAttribute("src");
          video.load();
        } catch {}
      }

      if (reason) console.debug("Camera teardown:", reason);
    },
    [unmountedRef]
  );

  const stopCamera = useCallback(() => {
    teardown("manual stop");
  }, [teardown]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (status !== "ready") return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prepare canvas dimensions (fallbacks included)
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    canvas.width = vw;
    canvas.height = vh;

    try { ctx.drawImage(video, 0, 0, vw, vh); } catch {}

    // Convert while stream still active (more reliable on some mobile browsers)
    canvas.toBlob(blob => {
      let file: File | null = null;
      if (blob) {
        file = new File([blob], `id-photo-${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
      } else {
        // Fallback via dataURL if blob failed
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          const byteString = atob(dataUrl.split(',')[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          file = new File([ab], `id-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        } catch {}
      }

      // Now stop camera (after we have the image data)
      teardown("capture");

      if (file) {
        onCapture(file);
      }

      // Close AFTER we have invoked onCapture so parent can store file
      onClose();
    }, "image/jpeg", 0.9);
  }, [status, teardown, onCapture, onClose]);

  const handleClose = useCallback(() => {
    teardown("close button");
    onClose();
  }, [teardown, onClose]);

  // Auto-start + lifecycle
  useEffect(() => {
    unmountedRef.current = false;
    startCamera();

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        stopCamera();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      unmountedRef.current = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      teardown("unmount");
    };
  }, [startCamera, stopCamera, teardown]);

  // Retry logic
  const retry = () => {
    teardown("retry");
    startCamera();
  };

  const isReady = status === "ready";
  const isStarting = status === "starting";

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Take Photo</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close camera"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={retry}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {(!isReady) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-neutral-950/95 z-10 border-b border-border">
                  <div className="text-center animate-pulse">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isStarting
                        ? "Starting camera..."
                        : status === "stopped"
                        ? "Camera stopped"
                        : status === "error"
                        ? "Camera error"
                        : "Preparing..."}
                    </p>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                aria-label="Camera preview"
              />
              {isReady && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white/70 rounded-lg">
                    <div className="absolute top-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                      Align your ID inside the frame
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isReady && (
              <div className="flex gap-2">
                <Button
                  onClick={capturePhoto}
                  className="flex-1"
                  size="lg"
                  aria-label="Capture photo"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  size="lg"
                  aria-label="Stop camera"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </CardContent>
      </Card>
    </div>
  );
}
