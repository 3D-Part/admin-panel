"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { HiCloudUpload } from "react-icons/hi";
import ImagePreview from "./components/ImagePreview/ImagePreview";
import { toast } from "react-toastify";

type RejectedFile = {
  file: File;
  errors: {
    code: string;
    message: string;
  }[];
};

type UploadFilesType = {
  setActiveFormData: (files: File[]) => void;
};

const UploadFiles: React.FC<UploadFilesType> = ({ setActiveFormData }) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: RejectedFile[]) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejectedFile) => {
          const errorMessage = rejectedFiles[0].errors[0].message;
          const toastMessage = `${rejectedFile.file.name} ${errorMessage}`;

          toast(toastMessage, {
            hideProgressBar: true,
            autoClose: 4000,
            type: "error",
          });
        });
      }

      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
    []
  );

  const removeFile = (name: string) => {
    setFiles((files) => files.filter((files) => files.name !== name));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  useEffect(() => {
    setActiveFormData(files);
  }, [files, setActiveFormData]);

  return (
    <div className="w-full flex flex-wrap gap-8">
      {/* UPLOAD AREA */}
      <div
        className="flex flex-wrap items-center justify-center w-full"
        {...getRootProps()}
      >
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center p-8 pb-6">
            <HiCloudUpload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              {isDragActive ? (
                <span>Drop the files here ...</span>
              ) : (
                // eslint-disable-next-line react/no-unescaped-entities
                <span>
                  Drag and drop some files here, or click to select files
                </span>
              )}
            </p>
            {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            SVG, PNG, JPG or GIF (MAX. 800x400px)
          </p> */}
          </div>
          <input {...getInputProps()} />
        </label>
      </div>

      {/* FILES PREVIEW */}
      <div className="w-full flex flex-wrap gap-4 mb-4">
        <h3 className="text-lg leading-none tracking-tight text-gray-800 dark:text-white">
          Accepted Files:
        </h3>

        <div className="w-full flex gap-6">
          {files.length > 0 &&
            files.map((file, index) => {
              return (
                <ImagePreview
                  key={index}
                  src={URL.createObjectURL(file)}
                  name={file.name}
                  removeAction={removeFile}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;
