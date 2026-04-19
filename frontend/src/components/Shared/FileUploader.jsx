import React, { useState, useRef } from "react";
import { Upload, X, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { uploadFiles } from "@/API_Call/Bug";

const MAX_FILES = 5;
const MAX_TOTAL_SIZE_MB = 50;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

export default function FileUploader({ files = [], onChange, label = "Attachments", compact = false }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} files.`);
      return;
    }

    const currentTotalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
    const newFilesTotalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

    if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE_BYTES) {
      toast.error(`Total file size must not exceed ${MAX_TOTAL_SIZE_MB}MB.`);
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading("Uploading to Cloudinary...");
    
    try {
      const res = await uploadFiles(selectedFiles);
      
      if (res.success && res.data.results) {
        const newUploadedFiles = res.data.results.map(file => ({
          id: file.publicId || Math.random().toString(36).substr(2, 9),
          name: file.fileName,
          size: file.size,
          url: file.url,
          uploadedAt: file.uploadedAt
        }));

        onChange([...files, ...newUploadedFiles]);
        toast.success("Files uploaded successfully", { id: uploadToast });
      } else {
        toast.error(res.message || "Failed to upload files", { id: uploadToast });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload", { id: uploadToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (id) => {
    onChange(files.filter(f => (f.id || f.url) !== id));
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const sizePercentage = (totalSize / MAX_TOTAL_SIZE_BYTES) * 100;

  return (
    <div className={`${compact ? 'space-y-1' : 'space-y-3'} w-full`}>
      <div className="flex items-center justify-between gap-2">
        {!compact && (
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {label}
            <span className="text-[10px] font-normal text-gray-400">
              ({files.length}/{MAX_FILES})
            </span>
          </label>
        )}
        
        {files.length < MAX_FILES && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            disabled={isUploading}
            className={`${compact ? 'h-7 px-2 text-[10px]' : 'h-8 px-3 text-xs'} w-full gap-2 border-dashed border-cyan-200 bg-cyan-50/30 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all`}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {isUploading ? "Uploading..." : "Add Files"}
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip"
      />

      {files.length > 0 && (
        <div className={`${compact ? 'space-y-1' : 'space-y-2'}`}>
          <div className="grid grid-cols-1 gap-1.5">
            {files.map((file) => (
              <div 
                key={file.id || file.url} 
                className={`flex items-center justify-between ${compact ? 'p-1.5' : 'p-2'} rounded-lg bg-gray-50 border border-gray-100 group hover:border-cyan-200 transition-all`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded bg-white border border-gray-100 flex items-center justify-center shrink-0`}>
                    <FileText className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="text-[10px] font-medium text-gray-700 truncate max-w-[120px]">{file.name || file.fileName}</span>
                    <span className="text-[9px] text-gray-400">{file.size ? formatSize(file.size) : "Cloud File"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => removeFile(file.id || file.url)}
                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-500 ${
                sizePercentage > 90 ? 'bg-red-500' : sizePercentage > 70 ? 'bg-orange-400' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(sizePercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {files.length === 0 && !isUploading && !compact && (
        <div 
          className="border-2 border-dashed border-gray-100 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-cyan-100 hover:bg-cyan-50/10 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
            <Upload className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-xs font-medium text-gray-500">Click to upload attachments</p>
          <p className="text-[10px] mt-1 italic">Images, Videos, PDFs (Max 50MB total)</p>
        </div>
      )}

      {isUploading && files.length === 0 && (
         <div className={`border-2 border-dashed border-cyan-100 bg-cyan-50/10 rounded-xl ${compact ? 'p-3' : 'p-6'} flex flex-col items-center justify-center text-cyan-400`}>
            <Loader2 className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} animate-spin mb-1`} />
            <p className="text-[10px] font-medium">Uploading...</p>
         </div>
      )}
    </div>
  );
}
