import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiDownload,
  FiExternalLink,
  FiMaximize2,
  FiMinimize2,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { FaImage, FaVideo } from "react-icons/fa6";
import moment from "moment";

const MediaModal = ({
  isOpen,
  onClose,
  media,
  mediaList = [],
  currentIndex = 0,
  onNavigate,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const containerRef = useRef(null);

  // Determine current active media (from mediaList if available, or direct media prop)
  const currentMedia =
    mediaList.length > 0 && currentIndex >= 0 && currentIndex < mediaList.length
      ? mediaList[currentIndex]
      : media;

  const isImage = currentMedia?.type === "image" || (!currentMedia?.type && !currentMedia?.videoUrl);
  const isVideo = currentMedia?.type === "video" || !!currentMedia?.videoUrl;
  const mediaUrl = currentMedia?.url || currentMedia?.imageUrl || currentMedia?.videoUrl;

  const hasPrev = mediaList.length > 1 && currentIndex > 0;
  const hasNext = mediaList.length > 1 && currentIndex < mediaList.length - 1;

  // Reset zoom, rotation and pan when media changes
  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetTransform();
  }, [currentIndex, mediaUrl, resetTransform]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle Fullscreen API change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev && onNavigate) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && hasNext && onNavigate) {
        onNavigate(currentIndex + 1);
      } else if (isImage) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          setZoom((prev) => Math.min(prev + 0.5, 4));
        } else if (e.key === "-") {
          e.preventDefault();
          setZoom((prev) => {
            const next = Math.max(prev - 0.5, 1);
            if (next === 1) setPosition({ x: 0, y: 0 });
            return next;
          });
        } else if (e.key === "0") {
          e.preventDefault();
          resetTransform();
        } else if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          setRotation((prev) => (prev + 90) % 360);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, hasPrev, hasNext, currentIndex, onNavigate, onClose, isImage, resetTransform]);

  if (!isOpen || !mediaUrl) return null;

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDoubleClick = () => {
    if (!isImage) return;
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetTransform();
    }
  };

  // Drag pan handlers (for zoomed images)
  const handleMouseDown = (e) => {
    if (!isImage || zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isImage || zoom <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Native fullscreen toggle
  const toggleNativeFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  // Download media file helper
  const handleDownload = async () => {
    if (!mediaUrl || downloading) return;
    setDownloading(true);

    try {
      const response = await fetch(mediaUrl, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const ext = isVideo ? "mp4" : "jpg";
      const filename = `media_${Date.now()}.${ext}`;

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback for CORS restricted URLs: open directly in new tab with download intention
      const link = document.createElement("a");
      link.href = mediaUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = `media_${Date.now()}`;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Controls */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Info: Type & Counter */}
        <div className="flex items-center gap-3 text-white/90 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium border border-white/10">
            {isImage ? <FaImage size={13} className="text-teal-400" /> : <FaVideo size={13} className="text-purple-400" />}
            <span>{isImage ? "Image" : "Video"}</span>
          </div>

          {mediaList.length > 1 && (
            <span className="text-xs sm:text-sm text-slate-300 font-medium">
              {currentIndex + 1} of {mediaList.length}
            </span>
          )}

          {currentMedia?.createdAt && (
            <span className="hidden sm:inline text-xs text-slate-400 border-l border-white/20 pl-3">
              {moment(currentMedia.createdAt).format("MMM D, YYYY · hh:mm A")}
            </span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Image-only controls */}
          {isImage && (
            <>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Zoom In (+)"
              >
                <FiZoomIn size={19} />
              </button>

              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  zoom <= 1
                    ? "text-white/30 cursor-not-allowed"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                title="Zoom Out (-)"
              >
                <FiZoomOut size={19} />
              </button>

              <button
                type="button"
                onClick={handleRotate}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Rotate 90° (R)"
              >
                <FiRotateCw size={18} />
              </button>

              {(zoom !== 1 || rotation !== 0) && (
                <button
                  type="button"
                  onClick={resetTransform}
                  className="px-2.5 py-1 text-xs text-teal-400 hover:text-teal-300 bg-white/10 hover:bg-white/15 rounded-md transition-colors cursor-pointer font-medium"
                  title="Reset Zoom & Rotation (0)"
                >
                  Reset
                </button>
              )}
            </>
          )}

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Download Media"
          >
            <FiDownload size={19} className={downloading ? "animate-bounce" : ""} />
          </button>

          {/* Open in new tab */}
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer inline-flex items-center"
            title="Open in new tab"
          >
            <FiExternalLink size={19} />
          </a>

          {/* Native Fullscreen */}
          <button
            type="button"
            onClick={toggleNativeFullscreen}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer hidden sm:block"
            title={isNativeFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isNativeFullscreen ? <FiMinimize2 size={19} /> : <FiMaximize2 size={19} />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/90 hover:text-white bg-white/10 hover:bg-red-600/80 rounded-lg transition-colors cursor-pointer ml-1 sm:ml-2"
            title="Close (Esc)"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Main Center Media Area */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden p-2 sm:p-6"
        onClick={onClose}
      >
        {/* Previous Button */}
        {hasPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className="absolute left-3 sm:left-6 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl hover:scale-110 border border-white/10"
            title="Previous (Left Arrow)"
          >
            <FiChevronLeft size={24} />
          </button>
        )}

        {/* Media Container */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isImage ? (
            <img
              src={mediaUrl}
              alt={currentMedia?.text || "Full screen preview"}
              onDoubleClick={handleDoubleClick}
              onMouseDown={handleMouseDown}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
              }}
              className="max-h-[82vh] max-w-[92vw] object-contain rounded-lg shadow-2xl select-none"
              draggable={false}
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[82vh] max-w-[92vw] object-contain rounded-xl shadow-2xl bg-black"
            />
          )}
        </div>

        {/* Next Button */}
        {hasNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className="absolute right-3 sm:right-6 z-30 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl hover:scale-110 border border-white/10"
            title="Next (Right Arrow)"
          >
            <FiChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Bar: Caption / Details (if any text is attached) */}
      {currentMedia?.text && (
        <div
          className="w-full pb-4 px-4 flex justify-center z-20 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-auto max-w-xl bg-black/70 backdrop-blur-md text-white/90 px-4 py-2.5 rounded-xl text-sm text-center border border-white/10 shadow-lg leading-relaxed break-words">
            {currentMedia.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaModal;
