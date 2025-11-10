"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { ArrowLeft, X, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Button, Textarea } from "@heroui/react";
import { Form } from "@heroui/form";
import { useDropzone } from "react-dropzone";

interface PhotoData {
  id: number;
  title: string;
  files: File[];
  description: string;
  isCover: boolean;
  coverPhotoIndex: number | null;
  previews: string[];
  originalName?: string;
}

interface RepositoryFormData {
  title: string;
  photos: PhotoData[];
}

interface RepositoryData {
  _id: string;
  title: string;
  images: Array<{ url: string; filename: string; originalName: string; description?: string }>;
  created_at: string;
  imageCount: number;
}

export default function EditImagesPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoCounter, setPhotoCounter] = useState(2);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Track filenames of existing images to delete
  const [formData, setFormData] = useState<RepositoryFormData>({
    title: "",
    photos: [
      {
        id: 1,
        title: "Existing Photos",
        files: [],
        description: "",
        isCover: false,
        coverPhotoIndex: null,
        previews: [],
      },
    ],
  });

  // Fetch repository data on component mount
  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`/api/admin/images/${id}`);
        const result = await response.json();

        if (result.success) {
          const repository: RepositoryData = result.data;

          // Pre-fill form data
          setFormData({
            title: repository.title,
            photos: [
              {
                id: 1,
                title: "Existing Photos",
                files: [], // New files will be added here
                description: "", // Repository-level description, not individual image descriptions
                isCover: false,
                coverPhotoIndex: null,
                previews: repository.images.map(img => img.url), // Use existing image URLs as previews
              },
            ],
          });
        } else {
          alert(`Error: ${result.message}`);
          router.push("/admin/images");
        }
      } catch (error) {
        console.error("Error fetching repository:", error);
        alert("Failed to load repository data");
        router.push("/admin/images");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRepository();
    }
  }, [id, router]);

  const handleBack = (): void => {
    router.push("/admin/images");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a repository title");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData to send to API
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());

      // Add images to delete
      if (imagesToDelete.length > 0) {
        formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      // Note: We're using repository-level description, not individual image descriptions

      // Add only new files (not existing ones)
      formData.photos.forEach((photo, photoIndex) => {
        photo.files.forEach((file, fileIndex) => {
          formDataToSend.append(`photo_${photoIndex}_file_${fileIndex}`, file);
        });
      });

      console.log("🚀 Updating repository...");
      console.log("Title:", formData.title);
      console.log("Images to delete:", imagesToDelete);
      console.log("New files:", formData.photos.reduce((sum, photo) => sum + photo.files.length, 0));

      const response = await fetch(`/api/admin/images/${id}/update`, {
        method: "PATCH",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Repository "${result.data.title}" updated successfully!`);
        router.push("/admin/images");
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("❌ Failed to update repository. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Example backend submission function
  const sendToBackend = async (data: RepositoryFormData) => {
    try {
      // If you need to upload files, use FormData
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append(
        "photos",
        JSON.stringify(
          data.photos.map((photo) => ({
            id: photo.id,
            title: photo.title,
            description: photo.description,
            isCover: photo.isCover,
            // Don't include files in JSON, upload them separately
          })),
        ),
      );

      // Append files
      data.photos.forEach((photo, photoIndex) => {
        photo.files.forEach((file, fileIndex) => {
          formData.append(`photo_${photoIndex}_file_${fileIndex}`, file);
        });
      });

      // const response = await fetch('/api/repository', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (response.ok) {
      //   console.log('Successfully saved to backend');
      // }
    } catch (error) {
      console.error("Error submitting to backend:", error);
    }
  };

  const handleCancel = (): void => {
    router.push("/admin/images");
  };

  const handleTitleChange = (value: string): void => {
    setFormData((prev) => ({
      ...prev,
      title: value,
    }));
  };

  const handlePhotoDescriptionChange = (photoId: number, description: string): void => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === photoId ? { ...photo, description } : photo,
      ),
    }));
  };

  const handleSetCoverPhoto = (imageIndex: number): void => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.id === 1
          ? { ...photo, isCover: true, coverPhotoIndex: imageIndex }
          : photo,
      ),
    }));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const newPreviews = acceptedFiles.map((file) =>
          URL.createObjectURL(file),
        );

        setFormData((prev) => ({
          ...prev,
          photos: prev.photos.map((photo) => {
            if (photo.id === 1) {
              const updatedFiles = [...photo.files, ...acceptedFiles];
              const updatedPreviews = [...photo.previews, ...newPreviews];

              // Auto-set cover photo logic for new images
              let isCover = photo.isCover;
              let coverPhotoIndex = photo.coverPhotoIndex;

              // If this is the first new image being added and no cover is set, make it cover
              if (photo.files.length === 0 && acceptedFiles.length === 1 && !photo.isCover) {
                isCover = true;
                coverPhotoIndex = photo.previews.length; // Index in the previews array
              }

              return {
                ...photo,
                files: updatedFiles,
                previews: updatedPreviews,
                isCover,
                coverPhotoIndex,
              };
            }

            return photo;
          }),
        }));
      }
    },
    [formData.photos],
  );

  const removeImagePreview = (previewIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) => {
        if (photo.id === 1) {
          const existingImagesCount = photo.previews.length - photo.files.length;
          const isExistingImage = previewIndex < existingImagesCount;

          if (isExistingImage) {
            // This is an existing image - add to deletion list and remove from previews
            const existingImageUrl = photo.previews[previewIndex];
            const filename = existingImageUrl.split('/').pop() || '';

            setImagesToDelete(prev => [...prev, filename]);
          } else {
            // This is a new uploaded file, revoke the object URL
            URL.revokeObjectURL(photo.previews[previewIndex]);
          }

          // Remove from arrays
          const updatedFiles = isExistingImage ? photo.files : photo.files.filter((_, index) => index !== (previewIndex - existingImagesCount));
          const updatedPreviews = photo.previews.filter((_, index) => index !== previewIndex);

          // Handle cover photo index adjustment
          let isCover = photo.isCover;
          let coverPhotoIndex = photo.coverPhotoIndex;

          if (photo.coverPhotoIndex === previewIndex) {
            // Cover photo was removed
            if (updatedPreviews.length === 0) {
              // No images left, clear cover photo
              isCover = false;
              coverPhotoIndex = null;
            } else if (updatedPreviews.length === 1) {
              // Only one image left, make it cover
              isCover = true;
              coverPhotoIndex = 0;
            } else {
              // Multiple images left, keep cover but adjust index if needed
              if (photo.coverPhotoIndex !== null && photo.coverPhotoIndex > previewIndex) {
                coverPhotoIndex = photo.coverPhotoIndex - 1;
              }
            }
          } else if (photo.coverPhotoIndex !== null && photo.coverPhotoIndex > previewIndex) {
            // Adjust cover photo index since an image before it was removed
            coverPhotoIndex = photo.coverPhotoIndex - 1;
          }

          return {
            ...photo,
            files: updatedFiles,
            previews: updatedPreviews,
            isCover,
            coverPhotoIndex,
          };
        }

        return photo;
      }),
    }));
  };

  const clearAllImages = () => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) => {
        if (photo.id === 1) {
          // Only clear new uploaded files, keep existing images
          photo.previews.forEach((preview, index) => {
            const isNewFile = index >= (photo.previews.length - photo.files.length);
            if (isNewFile) {
              URL.revokeObjectURL(preview);
            }
          });

          // Keep existing images, remove only new uploads
          const existingImagesCount = photo.previews.length - photo.files.length;
          const existingPreviews = photo.previews.slice(0, existingImagesCount);

          return {
            ...photo,
            files: [],
            previews: existingPreviews,
            isCover: existingPreviews.length > 0 ? photo.isCover : false,
            coverPhotoIndex: existingPreviews.length > 0 ? photo.coverPhotoIndex : null,
          };
        }
        return photo;
      }),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading repository...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="flex items-center justify-center p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          title="Go back"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Edit Repository
          </h1>
          <p className="mt-1 text-gray-500">Update your photo collection</p>
        </div>
      </div>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Repository Details</h3>
        </CardHeader>

        <CardBody>
          <div className="px-4 sm:px-6">
            <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Repository Title */}
              <Input
                isRequired
                errorMessage="Please enter a title"
                label="Repository Title"
                labelPlacement="outside"
                name="title"
                placeholder="e.g., Community Events 2025"
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />

              {/* Photos Section */}
              <div className="w-full">
                <Card className="p-4">
                  <CardHeader className="px-0 py-2">
                    <p className="font-semibold text-lg">Photos</p>
                  </CardHeader>

                  <CardBody className="overflow-visible py-2">
                    {/* Dynamic Photos */}
                    {formData.photos.map((photo, index) => (
                      <Card key={photo.id} className="mb-4 border">
                        <CardHeader className="px-4 py-3">
                          <p className="font-semibold text-md">{photo.title}</p>
                        </CardHeader>
                        <CardBody className="px-4 pb-4">
                          <div className="flex flex-col gap-4">
                            {/* Image Preview Section - Horizontal Scroll */}
                            {photo.previews.length > 0 && (
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-medium">
                                    Images ({photo.previews.length})
                                  </label>
                                  {photo.files.length > 0 && (
                                    <button
                                      className="text-xs text-red-500 hover:text-red-700"
                                      type="button"
                                      onClick={() => clearAllImages()}
                                    >
                                      Clear New Uploads
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {photo.previews.map((preview, previewIndex) => {
                                    const isExistingImage = previewIndex < (photo.previews.length - photo.files.length);
                                    return (
                                      <div
                                        key={previewIndex}
                                        className="relative flex-shrink-0 cursor-pointer"
                                        onClick={() => handleSetCoverPhoto(previewIndex)}
                                      >
                                        <img
                                          alt={`Preview ${previewIndex + 1}`}
                                          className={`w-20 h-20 object-cover rounded-lg border-2 ${
                                            photo.isCover && photo.coverPhotoIndex === previewIndex
                                              ? "border-blue-500 ring-2 ring-blue-200"
                                              : "border-gray-300"
                                          }`}
                                          src={preview}
                                        />
                                        {photo.isCover && photo.coverPhotoIndex === previewIndex && (
                                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold bg-blue-600 px-2 py-1 rounded">
                                              Cover Photo
                                            </span>
                                          </div>
                                        )}
                                        <button
                                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition text-xs shadow-lg"
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeImagePreview(previewIndex);
                                          }}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                        <div className="text-xs text-center mt-1 truncate w-20">
                                          {isExistingImage ? "Existing" : photo.files[previewIndex - (photo.previews.length - photo.files.length)]?.name}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Drag & Drop File Upload */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Add More Images
                              </label>
                              <PhotoDropzone
                                photo={photo}
                                onDrop={(files) => onDrop(files)}
                              />
                            </div>

                            <Textarea
                              className="w-full"
                              minRows={2}
                              placeholder="Photo description (optional)"
                              value={photo.description}
                              variant="flat"
                              onChange={(e) => handlePhotoDescriptionChange(photo.id, e.target.value)}
                            />

                            {photo.previews.length > 1 && (
                              <div className="text-sm text-gray-600">
                                <p>💡 <strong>Click on any image above to set it as cover photo</strong></p>
                                {photo.isCover && photo.coverPhotoIndex !== null && (
                                  <p className="text-blue-600 mt-1">
                                    Cover photo: Image {photo.coverPhotoIndex + 1}
                                  </p>
                                )}
                              </div>
                            )}

                            {photo.previews.length === 1 && photo.isCover && (
                              <div className="text-sm text-green-600">
                                <p>✅ <strong>Single image automatically set as cover photo</strong></p>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </CardBody>

                  <CardFooter className="px-4 pb-2">
                    {/* Footer content here (optional) */}
                  </CardFooter>
                </Card>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button color="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Repository"}
                </Button>
                <Button type="button" variant="flat" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </CardBody>

        <CardFooter />
      </Card>
    </div>
  );
}

// Separate component for the dropzone
interface PhotoDropzoneProps {
  photo: PhotoData;
  onDrop: (files: File[]) => void;
}

function PhotoDropzone({ photo, onDrop }: PhotoDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }
        ${photo.previews.length > 0 ? "bg-green-50 border-green-300" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <Upload
          className={`w-8 h-8 ${photo.previews.length > 0 ? "text-green-500" : "text-gray-400"}`}
        />
        {photo.previews.length > 0 ? (
          <div>
            <p className="text-green-600 font-medium">
              {photo.previews.length} image(s) selected
            </p>
            <p className="text-sm text-green-500">
              Click or drag to add more images
            </p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-500">Drop the images here...</p>
        ) : (
          <div>
            <p className="font-medium">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports: JPG, PNG, GIF, WEBP (Max 5MB each)
            </p>
            <p className="text-sm text-blue-500">
              You can select multiple images
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
