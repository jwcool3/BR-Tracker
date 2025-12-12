/**
 * Floor Scanner Uploader - Upload floor screenshot and process
 * Simple MVP version for testing the floor scanner
 */

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { processFloorScreenshot } from '../../services/floorScannerService';

export default function FloorScannerUploader({ brainrots, onScanComplete, onCancel }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Please use an image under 10MB.');
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Process
    setUploading(true);
    setProgress('Detecting brainrot cards...');

    try {
      // Small delay to let UI update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setProgress('Analyzing image with AI...');
      const result = await processFloorScreenshot(file, brainrots);
      
      if (!result.success) {
        throw new Error(result.error || 'Floor scan failed');
      }

      setProgress(`Success! Found ${result.totalCards} card(s)`);
      
      // Call parent with results
      setTimeout(() => {
        onScanComplete(result);
      }, 500);

    } catch (error) {
      console.error('Floor scan error:', error);
      setError(error.message || 'Failed to process floor. Please try again.');
      setUploading(false);
      setProgress('');
    }
  };

  return (
    <div className="floor-scanner-uploader">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">📸 Scan Floor</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          disabled={uploading}
        >
          <X size={20} />
        </button>
      </div>

      {/* Instructions */}
      {!preview && !uploading && (
        <div className="mb-4 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
          <p className="text-sm text-blue-300 mb-2">
            <strong>Tips for best results:</strong>
          </p>
          <ul className="text-xs text-gray-300 space-y-1 ml-4">
            <li>• Screenshot ONE SIDE of a floor (1-5 brainrots)</li>
            <li>• Make sure brainrot names are clearly visible</li>
            <li>• Include stats ($X.XM/s) if possible</li>
            <li>• Good lighting, no blur</li>
          </ul>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
          <p className="text-sm text-red-300">❌ {error}</p>
        </div>
      )}

      {/* Upload Zone or Preview */}
      {!preview ? (
        <div className="upload-zone">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="floor-upload-input"
          />
          <label
            htmlFor="floor-upload-input"
            className={`
              flex flex-col items-center justify-center
              min-h-64 border-2 border-dashed rounded-lg
              transition-all cursor-pointer
              ${uploading 
                ? 'border-slate-600 bg-slate-800 cursor-not-allowed' 
                : 'border-slate-600 hover:border-blue-500 hover:bg-slate-700/30'
              }
            `}
          >
            <Upload size={48} className="text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">Click to upload floor screenshot</p>
            <p className="text-sm text-gray-400">or drag and drop</p>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB</p>
          </label>
        </div>
      ) : (
        <div className="preview-section">
          {/* Image Preview */}
          <div className="relative mb-4">
            <img
              src={preview}
              alt="Floor preview"
              className="w-full max-h-96 object-contain rounded-lg bg-slate-900"
            />
            {!uploading && (
              <button
                onClick={() => {
                  setPreview(null);
                  setError(null);
                }}
                className="absolute top-2 right-2 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Processing Status */}
          {uploading && (
            <div className="processing-status">
              <div className="flex items-center justify-center gap-3 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                <Loader2 size={20} className="animate-spin text-blue-400" />
                <span className="text-blue-300">{progress}</span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Using AI to detect brainrot cards...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                  <span>This usually takes 5-10 seconds</span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Again Button */}
          {!uploading && (
            <button
              onClick={() => document.getElementById('floor-upload-input').click()}
              className="w-full btn-secondary"
            >
              Upload Different Image
            </button>
          )}
        </div>
      )}

      {/* Debug Info */}
      {brainrots && (
        <div className="mt-4 p-2 bg-slate-900 rounded text-xs text-gray-500">
          <div>📊 Database: {brainrots.length} brainrots loaded</div>
          <div>🔧 Mode: {import.meta.env?.VITE_CLAUDE_API_KEY ? 'Production (AI)' : 'Mock (Testing)'}</div>
        </div>
      )}
    </div>
  );
}

