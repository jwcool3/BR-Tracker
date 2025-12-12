/**
 * Simple Floor Scanner Uploader - Minimal version for testing
 */

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

export default function FloorScannerUploaderSimple({ brainrots, onScanComplete, onCancel }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    try {
      console.log('🚀 Starting to process file:', selectedFile.name);
      console.log('📊 Using WHOLE FLOOR VISION (new method)');
      
      // Import the NEW whole-floor vision service
      const { extractAllBrainrotsFromFloor } = await import('../../services/wholeFloorVisionService');
      
      console.log('📦 Service imported successfully');
      console.log('🧠 Brainrots available:', brainrots?.length);
      
      const result = await extractAllBrainrotsFromFloor(selectedFile, brainrots);
      
      console.log('✅ Processing complete:', result);
      
      if (result.success) {
        // Transform result to match expected format
        const transformedResult = {
          success: true,
          totalCards: result.totalBrainrots,
          successfulExtractions: result.successfulExtractions,
          failedExtractions: result.failedExtractions,
          successful: result.brainrots.filter(b => b.success).map((b, idx) => ({
            ...b,
            cardIndex: idx,
            cardId: b.position,
            imageData: null, // No individual card images in whole-floor mode
            metadata: {
              ...b.metadata,
              method: 'whole_floor_vision'
            }
          })),
          failed: result.brainrots.filter(b => !b.success).map((b, idx) => ({
            ...b,
            cardIndex: idx,
            cardId: b.position,
            imageData: null
          })),
          metadata: {
            method: 'whole_floor_vision',
            layout: result.layout,
            overallConfidence: result.overallConfidence
          }
        };
        
        onScanComplete(transformedResult);
      } else {
        alert('Processing failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error during processing:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">📸 Scan Floor (Simple Mode)</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-yellow-600/10 border border-yellow-600/30 rounded text-sm">
        <div>🐛 Debug Mode Active</div>
        <div>Brainrots loaded: {brainrots?.length || 0}</div>
        <div>File selected: {selectedFile ? selectedFile.name : 'None'}</div>
        <div>Mode: {import.meta.env?.VITE_CLAUDE_API_KEY ? 'AI Detection' : 'Mock Detection'}</div>
      </div>

      {/* Upload Zone */}
      {!preview ? (
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="simple-upload-input"
          />
          <label
            htmlFor="simple-upload-input"
            className="flex flex-col items-center justify-center min-h-64 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg cursor-pointer transition-all hover:bg-slate-700/30"
          >
            <Upload size={48} className="text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">Click to upload floor screenshot</p>
            <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
          </label>
        </div>
      ) : (
        <div className="mb-4">
          {/* Preview */}
          <div className="relative mb-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-96 object-contain rounded-lg bg-slate-900 border border-slate-700"
            />
            <button
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
              }}
              className="absolute top-2 right-2 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors"
          >
            🚀 Process Floor Screenshot
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg text-sm">
        <p className="text-blue-300 mb-1"><strong>Tips:</strong></p>
        <ul className="text-xs text-gray-300 space-y-1 ml-4">
          <li>• Upload a screenshot showing 1-5 brainrots</li>
          <li>• Make sure brainrot names are visible</li>
          <li>• Check console (F12) for detailed logs</li>
        </ul>
      </div>
    </div>
  );
}

