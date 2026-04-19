import React, { useState } from "react";
import { FileText, X, Plus, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUploader from "./FileUploader";

export default function AttachmentGallery({ 
  files = [], 
  isEditable = false, 
  onUpdate, 
  label = "Attachments" 
}) {
  const [showUploader, setShowUploader] = useState(false);

  const safeFiles = Array.isArray(files) ? files : [];

  const isImage = (url) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)$/i) || 
           url.includes("cloudinary.com") ||
           url.includes("res.cloudinary.com");
  };

  const handleDelete = (id) => {
    const newFiles = safeFiles.filter(f => (f.id || f.url) !== id);
    onUpdate(newFiles);
  };

  if (isEditable && (showUploader || safeFiles.length === 0)) {
    return (
      <div className="min-w-[220px] p-2 bg-white rounded-xl border border-cyan-100 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200 z-50">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-tight">{label}</span>
          {safeFiles.length > 0 && (
            <button 
              onClick={() => setShowUploader(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
        <FileUploader 
          files={[]} 
          onChange={(newBatch) => {
            onUpdate([...safeFiles, ...newBatch]);
            setShowUploader(false);
          }}
          label=""
          compact={true}
        />
        {safeFiles.length > 0 && (
           <Button 
             variant="ghost" 
             size="sm" 
             className="w-full mt-2 h-7 text-[10px] text-gray-500 hover:bg-gray-50"
             onClick={() => setShowUploader(false)}
           >
             Cancel
           </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5 items-center py-2 min-h-[52px]">
      {safeFiles.map((file, idx) => {
        const fileId = file.id || file.url || `file-${idx}`;
        const fileName = file.name || file.fileName || "File";
        const fileUrl = file.url;
        const isImg = isImage(fileUrl);

        return (
          <div 
            key={fileId} 
            className="relative group w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 hover:border-cyan-400 hover:shadow-md transition-all duration-300"
          >
            {/* Thumbnail Container */}
            <div className="w-full h-full rounded-xl overflow-hidden">
              {isImg ? (
                <img 
                  src={fileUrl} 
                  alt={fileName} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:blur-[1px]" 
                  onError={(e) => {
                     e.target.onerror = null;
                     e.target.src = "https://placehold.co/48x48?text=File";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
              )}
            </div>

            {/* Corner Badges: TOP-RIGHT (VIEW) */}
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg border-2 border-white scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 hover:bg-cyan-700 z-10"
              title="View Full Size"
            >
              <Eye className="w-3 h-3" />
            </a>

            {/* Corner Badges: TOP-LEFT (DELETE) - Only if editable */}
            {isEditable && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(fileId);
                }}
                className="absolute -top-1.5 -left-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg border-2 border-white scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 delay-75 hover:bg-red-600 z-10"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            {/* File Extension Tag (Bottom) */}
            <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded-md bg-black/40 text-[7px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase pointer-events-none">
              {fileName.split('.').pop()}
            </div>
          </div>
        );
      })}

      {isEditable && safeFiles.length < 5 && (
        <button 
          onClick={() => setShowUploader(true)}
          className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 bg-slate-50 flex items-center justify-center text-gray-400 hover:text-cyan-600 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all shadow-sm group"
          title="Add New Attachment"
        >
          <Plus className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
        </button>
      )}

      {safeFiles.length === 0 && !isEditable && (
        <span className="text-slate-400 text-[10px] font-medium italic px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-1.5 select-none">
          <FileText className="w-3.5 h-3.5" />
          No files
        </span>
      )}
    </div>
  );
}
