import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { toast } from "sonner";
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "chatmedia786.firebaseapp.com",
  projectId: "chatmedia786",
  storageBucket: "chatmedia786.appspot.com",
  messagingSenderId: "982442102270",
  appId: "1:982442102270:web:10f10383c7138ae355c4af",
  measurementId: "G-N0Q8JFYFVE",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function handleFirebaseImageUpload(file: File) {
  const storageRef = ref(storage, `images/${file.name}`);
  await uploadBytes(storageRef, file);
  const res = await getDownloadURL(storageRef);
  return {
    success: true,
    file: {
      url: res,
    },
  };
}
interface fileType {
  name: string;
  type: string;
  url: string;
} 
interface multipleImageUploadReturnType {
  success?: boolean;
  error?: string;
  files?: fileType[];
}
async function handleMultipleFirebaseUploads(
  files: File[],
  onProgress: (index: number, progress: number) => void,
): Promise<multipleImageUploadReturnType> {
  if (files.length > 5) {
    toast.warning("You can upload a maximum of 5 files.");
    return {
      success: false,
      error: "You can upload a maximum of 5 files.",
    };
  }

  const uploadPromises = files.map((file, i) => {
    return new Promise(async (resolve, reject) => {
      const storageRef = ref(
        storage,
        `images/${file.type.split("/")[0]}-${file.name}`,
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(i, Math.round(progress));
        },
        reject,
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              name: file.name,
              url: downloadURL,
              type: file.type.split("/")[0],
            });
          } catch (err) {
            reject(err);
          }
        },
      );
    });
  });

  const uploadedFiles = await Promise.all(uploadPromises);
  toast.success("Media Upload.");
  return {
    success: true,
    files: uploadedFiles as fileType[],
  };
}


export { storage, handleFirebaseImageUpload, handleMultipleFirebaseUploads , };
