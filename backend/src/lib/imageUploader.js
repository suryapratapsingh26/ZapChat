import { Worker } from "worker_threads";

export const uploadImage = (base64Image) => {
  return new Promise((resolve, reject) => {
    // Assuming your worker file is in 'src/lib/cloudinaryWorker.js'
    const worker = new Worker("./src/lib/cloudinaryWorker.js", { workerData: base64Image });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};