/**
 * Image Cropper Modal Component
 * 
 * Provides drag-to-crop functionality with zoom for avatar and cover images
 * - Avatar: 1:1 aspect ratio (square)
 * - Cover: 16:9 aspect ratio (wide banner)
 */

'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  cropType: 'avatar' | 'cover';
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  cropType,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  // Aspect ratios
  const aspectRatio = cropType === 'avatar' ? 1 : 16 / 9;

  // Handle crop complete
  const onCropAreaChange = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Create cropped image blob
  const createCroppedImage = async (): Promise<Blob> => {
    if (!croppedAreaPixels) {
      throw new Error('No crop area defined');
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size to cropped area
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Draw cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.95
        );
      };

      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  };

  // Handle save
  const handleSave = async () => {
    try {
      setProcessing(true);
      const croppedBlob = await createCroppedImage();
      onCropComplete(croppedBlob);
      onClose();
    } catch (error) {
      console.error('Crop error:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0a1532] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Crop {cropType === 'avatar' ? 'Avatar' : 'Cover Image'}
            </h2>
            <p className="text-sm text-white/60">
              Drag to reposition • Scroll to zoom
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[500px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropAreaChange}
            style={{
              containerStyle: {
                backgroundColor: '#000',
              },
              cropAreaStyle: {
                border: '2px solid #3b82f6',
                color: 'rgba(59, 130, 246, 0.5)',
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="border-t border-white/10 px-6 py-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-white/80">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={processing}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Save Cropped Image'}
            </button>
          </div>
        </div>

        {/* Aspect Ratio Info */}
        <div className="border-t border-white/10 bg-white/5 px-6 py-3">
          <p className="text-xs text-white/50">
            {cropType === 'avatar' ? (
              <>
                <span className="font-semibold text-white/70">Avatar Ratio:</span> 1:1 (Square) - Perfect for profile pictures
              </>
            ) : (
              <>
                <span className="font-semibold text-white/70">Cover Ratio:</span> 16:9 (Wide) - Optimized for banner display
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
