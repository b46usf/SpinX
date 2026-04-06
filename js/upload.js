import { authApi } from './auth/AuthApi.js';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadPaymentProof({
  file,
  source = 'landing',
  schoolName = '',
  email = '',
  plan = 'starter'
} = {}) {
  if (!file) {
    throw new Error('File bukti transfer belum dipilih.');
  }

  const base64Data = await fileToBase64(file);
  const result = await authApi.call('uploadpaymentproof', {
    base64Data,
    fileName: file.name || '',
    mimeType: file.type || '',
    source,
    schoolName,
    email,
    plan
  }, false);

  if (!result?.success) {
    throw new Error(result?.message || 'Upload bukti transfer gagal.');
  }

  return result;
}

export default {
  uploadPaymentProof
};
