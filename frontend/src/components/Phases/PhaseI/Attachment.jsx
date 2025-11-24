import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

function Attachment({
  selectedImage,
  setSelectedImage,
  selectedVideo,
  setSelectedVideo,
}) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const removeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Attachments/Url ?</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Upload Image */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Image</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Image</p>
                </label>
              </div>
              {selectedImage && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <span className="text-sm truncate">{selectedImage.name}</span>
                  <button
                    onClick={removeImage}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Video */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Video</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Video</p>
                </label>
              </div>
              {selectedVideo && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <span className="text-sm truncate">{selectedVideo.name}</span>
                  <button
                    onClick={removeVideo}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageUrl" className="text-sm font-medium">
              Page URL or Path
            </Label>
            <Input
              id="pageUrl"
              placeholder="/dashboard/profile"
              className="border-2 focus:border-primary rounded-lg"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default Attachment;
