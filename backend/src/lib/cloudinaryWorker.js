import { parentPort, workerData } from "worker_threads";
import cloudinary from "./cloudinary.js";

const uploadImage = async (image) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(image, {
      resource_type: "image",
    });
    return uploadResponse.secure_url;
  } catch (error) {
    // Re-throw the error to be caught by the 'error' event listener on the main thread
    throw new Error(error.message || "Cloudinary upload failed in worker");
  }
};

// Ensure this script is being run as a worker
if (!parentPort) {
  throw new Error("This script must be run as a worker thread.");
}

uploadImage(workerData)
  .then((url) => parentPort.postMessage(url))
  .catch((err) => {
    throw err;
  });