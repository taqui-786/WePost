// Re-export R2 uploaders to ensure backward compatibility across the app
import { handleR2ImageUpload, handleMultipleR2Uploads } from "./upload";

export const handleFirebaseImageUpload = handleR2ImageUpload;
export const handleMultipleFirebaseUploads = handleMultipleR2Uploads;
