import { ChangeEvent, useState } from "react";
import { toast ,ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const MultipleFileUploadForm = () => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [processfiles, setProcessFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const onProcess = async () => {
    if (processfiles.length > 0) {
      toast('Upload started.', { hideProgressBar: true, autoClose: 2000, type: 'success' ,position:'top-center' });

      setUploading(true);
      /** Uploading files to the server */
      try {
        var formData = new FormData();
        processfiles.forEach((file) => formData.append("media", file));
        formData.append("_cleanDB", globalThis._cleanDB.toString()); 
        const res = await fetch("/api/upload/", {
          method: "POST",
          body: formData,
        });

        const {
          data,
          error,
        }: {
          data: {
            url: string | string[];
          } | null;
          error: string | null;
        } = await res.json();

        if (error || !data) {
          alert(error || "Sorry! something went wrong.");
          return;
        }

        console.log("Files were uploaded successfylly:", data);
        toast('Files were uploaded successfylly!', { hideProgressBar: true, autoClose: 2000, type: 'success',position:'top-center' })

      } catch (error) {
        console.error(error);
        alert("Sorry! something went wrong.");
      } finally {
        setPreviewUrls([]);
        setProcessFiles([]);
        setUploading(false);
      }
    }
  }

  const onFilesUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    console.log("onFilesUploadChange = " + globalThis._cleanDB);

    if (!fileInput.files) {
      alert("No files were chosen");
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      alert("Files list is empty");
      return;
    }

    /** Files validation */
    const validFiles: File[] = [];
    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];

      if (!file.type.startsWith("application/pdf")) {
        alert(`File with idx: ${i} is invalid`);
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      alert("No valid files were chosen");
      return;
    }

    setPreviewUrls(
      validFiles.map((validFile) => validFile.name)
    );
    setProcessFiles(validFiles);

    /** Reset file input */
    fileInput.type = "text";
    fileInput.type = "file";

  };

  return (
    <form
      className="w-full p-3 border border-gray-500 border-dashed"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col md:flex-row gap-1.5 md:py-4">
        <div className="flex-grow">
          {previewUrls.length > 0 && !uploading? (
            <div className="mx-auto w-80">
              {previewUrls.map((previewUrl) => (
                <div key={previewUrl} className="w-full p-1.5 md:w-1/2">
                  {previewUrl}
                </div>
              ))}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              {uploading ?
                <strong className="text-sm font-medium">Uploading ... </strong> :
                <strong className="text-sm font-medium">Select PDF Files</strong>
              }
              <input
                className="block w-0 h-0"
                disabled={uploading}
                name="file"
                type="file"
                onChange={onFilesUploadChange}
                multiple
              />
            </label>
          )}
        </div>
        <div className="flex mt-4 md:mt-0 md:flex-col justify-center gap-1.5">
          <button
            disabled={previewUrls.length == 0 || uploading}
            onClick={() => {
              setPreviewUrls([]);
              setProcessFiles([]);
            }}
            className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
          >
            Cancel file
          </button>
          <button
            disabled={previewUrls.length == 0 || uploading}
            onClick={onProcess}
            className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
          >
            Upload file
          </button>
        </div>
      </div>
      <ToastContainer />
    </form>
  );
};
export default MultipleFileUploadForm;
