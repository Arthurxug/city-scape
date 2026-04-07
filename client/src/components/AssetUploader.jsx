import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, File, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadAsset, getAssets } from '../lib/api';
import LoadingSpinner from './LoadingSpinner';

const fileTypeIcon = (type) => {
  if (type === 'image') return <Image size={14} className="text-blue-400" />;
  if (type === 'pdf' || type === 'docx' || type === 'txt') return <FileText size={14} className="text-gold" />;
  return <File size={14} className="text-text-muted" />;
};

// Compact asset selector for the Delegate page
export function AssetSelector({ selectedAssets, onToggle, assets, isLoading }) {
  if (isLoading) {
    return <div className="flex items-center gap-2 text-text-muted font-mono text-xs"><LoadingSpinner size="sm" /> Loading assets...</div>;
  }
  if (!assets || assets.length === 0) {
    return (
      <p className="text-text-faint font-mono text-xs">
        No assets uploaded yet. Go to{' '}
        <a href="/assets" className="text-gold hover:underline">Assets</a>{' '}
        to upload company documents.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
      {assets.map((asset) => {
        const isSelected = selectedAssets.some((a) => a.id === asset.id);
        return (
          <button
            key={asset.id}
            onClick={() => onToggle(asset)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded border text-left transition-all ${
              isSelected
                ? 'border-gold/50 bg-gold/5 text-text-primary'
                : 'border-white/5 bg-bg-elevated text-text-muted hover:border-white/10 hover:text-text-primary'
            }`}
          >
            {fileTypeIcon(asset.file_type)}
            <span className="font-mono text-xs flex-1 truncate">{asset.name}</span>
            {asset.tags?.length > 0 && (
              <span className="font-label text-[9px] text-text-faint border border-white/10 px-1 rounded">
                {asset.tags[0]}
              </span>
            )}
            {isSelected && <Check size={11} className="text-gold flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

// Full drag-and-drop uploader for the Assets page
export default function AssetUploader({ onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const inputRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() { setIsDragging(false); }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setPendingFile(file);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) setPendingFile(file);
  }

  async function handleUpload() {
    if (!pendingFile) return;
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    setIsUploading(true);
    try {
      const asset = await uploadAsset(pendingFile, tags);
      toast.success(`${pendingFile.name} uploaded`);
      setPendingFile(null);
      setTagInput('');
      onUploaded?.(asset);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !pendingFile && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-gold bg-gold/5'
            : pendingFile
            ? 'border-success/40 bg-success/5'
            : 'border-white/10 hover:border-gold/30 hover:bg-white/2'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif"
          onChange={handleFileSelect}
        />
        {pendingFile ? (
          <div className="flex items-center justify-center gap-3">
            {fileTypeIcon(pendingFile.name.split('.').pop())}
            <span className="font-mono text-sm text-text-primary">{pendingFile.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setPendingFile(null); }}
              className="text-text-muted hover:text-danger"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={24} className="text-text-faint mx-auto mb-2" />
            <p className="font-mono text-sm text-text-muted">Drop a file here or click to browse</p>
            <p className="font-mono text-xs text-text-faint mt-1">PDF, DOCX, TXT, JPG, PNG — max 20MB</p>
          </>
        )}
      </div>

      {/* Tags + Upload button */}
      {pendingFile && (
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1 text-xs"
            placeholder="Tags (comma-separated): brand, sop, client..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {isUploading ? <LoadingSpinner size="sm" /> : <Upload size={14} />}
            Upload
          </button>
        </div>
      )}
    </div>
  );
}
