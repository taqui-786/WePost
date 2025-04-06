import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";

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

export { storage, handleFirebaseImageUpload };
