import React, { useState, useEffect } from 'react';
import { FileText, Image, File, Trash2, Eye, Tag, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssets, deleteAsset, getAsset } from '../lib/api';
import AssetUploader from '../components/AssetUploader';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const FILE_ICONS = {
  pdf:   <FileText size={20} className="text-gold" />,
  docx:  <FileText size={20} className="text-blue-400" />,
  txt:   <FileText size={20} className="text-text-muted" />,
  image: <Image size={20} className="text-teal-400" />,
  other: <File size={20} className="text-text-faint" />,
};

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTag, setFilterTag] = useState('');
  const [previewAsset, setPreviewAsset] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => { loadAssets(); }, []);

  async function loadAssets() {
    setIsLoading(true);
    try {
      const data = await getAssets(filterTag ? { tags: filterTag } : {});
      setAssets(data);
    } catch (err) {
      toast.error('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(asset) {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
    try {
      await deleteAsset(asset.id);
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      toast.success(`${asset.name} deleted`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handlePreview(asset) {
    if (asset.file_type === 'image') {
      setPreviewAsset({ ...asset, isImage: true });
      return;
    }
    setPreviewLoading(true);
    try {
      const full = await getAsset(asset.id);
      setPreviewAsset(full);
    } catch (err) {
      toast.error('Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  }

  // Collect all unique tags
  const allTags = [...new Set(assets.flatMap(a => a.tags || []))];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-text-primary">Asset Library</h1>
          <p className="font-mono text-sm text-text-muted mt-1">
            Company documents and files used as context for agent tasks
          </p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="btn-primary flex items-center gap-2"
        >
          <Upload size={14} /> Upload Asset
        </button>
      </div>

      {/* Upload panel */}
      {showUploader && (
        <div className="card p-5 mb-5 border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <p className="label">Upload New Asset</p>
            <button onClick={() => setShowUploader(false)} className="text-text-faint hover:text-text-muted font-mono text-xs">
              ✕ Close
            </button>
          </div>
          <AssetUploader
            onUploaded={(asset) => {
              setAssets(prev => [asset, ...prev]);
              setShowUploader(false);
            }}
          />
        </div>
      )}

      <div className="flex gap-6">
        {/* Tag filter sidebar */}
        {allTags.length > 0 && (
          <div className="w-40 flex-shrink-0">
            <p className="label mb-3">Filter by Tag</p>
            <div className="space-y-1">
              <button
                onClick={() => setFilterTag('')}
                className={`w-full text-left px-2 py-1.5 rounded font-mono text-xs transition-colors ${
                  !filterTag ? 'text-gold bg-gold/5' : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                  className={`w-full text-left px-2 py-1.5 rounded font-mono text-xs transition-colors flex items-center gap-1.5 ${
                    filterTag === tag ? 'text-gold bg-gold/5' : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <Tag size={10} /> {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Asset grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <File size={40} className="text-text-faint mb-4 opacity-30" />
              <p className="font-mono text-sm text-text-muted">No assets uploaded yet</p>
              <p className="font-mono text-xs text-text-faint mt-1">
                Upload PDFs, Word docs, or images to use as context for your agents
              </p>
              <button onClick={() => setShowUploader(true)} className="btn-primary mt-4 text-sm">
                Upload First Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="card p-4 hover:border-white/10 transition-all group">
                  {/* Icon + name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {FILE_ICONS[asset.file_type] || FILE_ICONS.other}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-text-primary truncate" title={asset.name}>
                        {asset.name}
                      </p>
                      <p className="font-mono text-[10px] text-text-faint mt-0.5">
                        {asset.file_type.toUpperCase()} · {formatBytes(asset.file_size)}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {asset.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {asset.tags.map(tag => (
                        <span key={tag} className="font-label text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/10 text-text-faint">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <p className="font-mono text-[10px] text-text-faint mb-3">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {asset.file_type !== 'image' && (
                      <button
                        onClick={() => handlePreview(asset)}
                        className="btn-ghost flex items-center gap-1 text-xs"
                      >
                        {previewLoading ? <LoadingSpinner size="sm" /> : <Eye size={11} />} Preview
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(asset)}
                      className="btn-danger flex items-center gap-1 text-xs"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
        title={previewAsset?.name || 'Preview'}
        size="xl"
      >
        {previewAsset && (
          <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
              {FILE_ICONS[previewAsset.file_type]}
              <div>
                <p className="font-mono text-sm text-text-primary">{previewAsset.name}</p>
                <p className="font-mono text-xs text-text-faint">{formatBytes(previewAsset.file_size)}</p>
              </div>
            </div>

            {previewAsset.extracted_text ? (
              <div>
                <p className="label mb-2">Extracted Text</p>
                <pre className="bg-bg-elevated border border-white/5 rounded p-4 font-mono text-xs text-text-muted whitespace-pre-wrap overflow-y-auto max-h-[500px]">
                  {previewAsset.extracted_text}
                </pre>
              </div>
            ) : (
              <p className="text-text-faint font-mono text-sm text-center py-8">
                {previewAsset.file_type === 'image' ? 'Image preview not available' : 'No text content extracted'}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
