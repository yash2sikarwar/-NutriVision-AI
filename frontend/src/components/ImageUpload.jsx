import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { compressImage } from '../utils/imageCompression';
import CameraCapture from './CameraCapture';

export default function ImageUpload({ onUploadStart, onUploadSuccess, onUploadError }) {
  const [dragActive, setDragActive] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection and start analysis upload
  const processAndUploadFile = async (file) => {
    if (!file) return;

    // Validate size (5MB max) and type
    if (!file.type.startsWith('image/')) {
      onUploadError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    setIsLoading(true);
    onUploadStart();
    setPreviewUrl(URL.createObjectURL(file));

    try {
      // 1. Run client-side image compression
      const compressedFile = await compressImage(file);

      // 2. Build Multi-part Form payload
      const formData = new FormData();
      formData.append('image', compressedFile);

      // 3. Post to API analyze endpoint
      const response = await fetch('/api/food/analyze', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        onUploadSuccess(result.data, result.baseNutrition);
      } else if (response.status === 422 && (result.lowConfidence || result.notFood)) {
        onUploadSuccess(result.data, null);
      } else {
        onUploadError(result.message || 'Failed to analyze the food image.');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      onUploadError('Network error. Make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processAndUploadFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (useCamera) {
    return (
      <CameraCapture
        onCapture={(file) => {
          setUseCamera(false);
          processAndUploadFile(file);
        }}
        onCancel={() => setUseCamera(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={isLoading ? null : triggerFileInput}
        className={`relative flex flex-col items-center justify-center min-h-[320px] rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer p-8 text-center ${
          dragActive
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 scale-[0.99] shadow-inner shadow-brand-100 dark:shadow-none'
            : 'border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/70 hover:border-brand-400 backdrop-blur-md'
        } ${isLoading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
          id="food-image-input"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            {previewUrl && (
              <div className="relative h-28 w-28 rounded-2xl overflow-hidden border-2 border-brand-500 shadow-md animate-pulse">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-brand-500/10 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Analyzing Food Item...</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Scanning image textures, detecting shapes, and mapping nutritional data.
              </p>
            </div>
            
            {/* Mock loading steps to make progress engaging */}
            <div className="flex items-center space-x-1 text-xs text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950/40 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping mr-1" />
              Running Neural Networks...
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-500 shadow-sm">
              <UploadCloud className="h-10 w-10 animate-pulse-slow" />
            </div>
            
            <div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-white">
                Upload Food Photograph
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Drag and drop your food picture here, or <span className="text-brand-500 font-semibold">browse your device</span>.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full max-w-xs pt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUseCamera(true);
                }}
                className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors hover:bg-slate-50"
                id="camera-capture-btn"
              >
                <Camera className="h-4 w-4 mr-2 text-brand-500" />
                Live Camera
              </button>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">
              Supports PNG, JPG, JPEG, or WEBP up to 5MB. Client-side compression enabled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
