import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bug, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";

function BugForm() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [selectedTool, setSelectedTool] = useState("");

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
    <div className="space-y-6 py-4">
      {/* Bug Title */}
      <div className="space-y-2">
        <Label
          htmlFor="title"
          className="text-sm font-medium flex gap-2 items-center"
        >
          Tool Name
          <span className="block text-gray-500 text-xs">(Category)</span>
        </Label>

        <Select value={selectedTool} onValueChange={setSelectedTool}>
          <SelectTrigger className="w-full border-2 rounded-lg focus:border-primary">
            <div className="flex flex-col text-left">
              <SelectValue placeholder="Select Tool Name" />
            </div>
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>CBXMEET</SelectLabel>

              <SelectItem value="cbx_ios">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">CBXMEET</span>
                  <span className="text-xs text-muted-foreground">(iOS)</span>
                </div>
              </SelectItem>

              <SelectItem value="cbx_android">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">CBXMEET</span>
                  <span className="text-xs text-muted-foreground">
                    (Android)
                  </span>
                </div>
              </SelectItem>

              <SelectItem value="cbx_web">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">CBXMEET</span>
                  <span className="text-xs text-muted-foreground">
                    (Website)
                  </span>
                </div>
              </SelectItem>

              <SelectSeparator />

              <SelectLabel>DatawebFrom</SelectLabel>

              <SelectItem value="dataweb_web">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">DatawebFrom</span>
                  <span className="text-xs text-muted-foreground">
                    (Website)
                  </span>
                </div>
              </SelectItem>

              <SelectItem value="dataweb_appscript">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">DatawebFrom</span>
                  <span className="text-xs text-muted-foreground">
                    (App Script)
                  </span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* <Input
          id="title"
          placeholder="Feedback Form Submission Fails (Chrome Desktop)"
          className="border-2 focus:border-primary rounded-lg"
        /> */}
      </div>

      {/* Bug Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Bug description
        </Label>
        <Textarea
          id="description"
          placeholder="When I click the 'Submit' button on the feedback form, the page reloads but nothing is submitted. No confirmation message appears, and the data is lost. Happens in Chrome on desktop."
          rows={6}
          className="border-2 focus:border-primary rounded-lg resize-none"
        />
        <p className="text-xs text-gray-500">
          Describe the issue, steps to reproduce, and browser/device.
        </p>
      </div>

      {/* Page URL and Priority in Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Page URL */}
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

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-sm font-medium">
            Priority
          </Label>
          <select
            id="priority"
            className="w-full h-10 px-3 border-2 rounded-lg focus:border-primary focus:outline-none"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="critical">🔴 Critical</option>
          </select>
        </div>
      </div>

      {/* Upload Image and Video */}
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

      {/* Email (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Your email (optional)
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="proof.of.email@decentralized.biz"
          className="border-2 focus:border-primary rounded-lg"
        />
      </div>
    </div>
  );
}

export default BugForm;
