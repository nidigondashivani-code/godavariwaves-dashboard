import uploadConfig from '../config/multer.config';

export const uploadSingle = (fieldName = 'file') => uploadConfig.single(fieldName);
export const uploadMultiple = (fieldName = 'files', maxCount = 5) =>
  uploadConfig.array(fieldName, maxCount);

export default { uploadSingle, uploadMultiple };
