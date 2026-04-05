/**
 * ImportModal Component
 * Reusable modal for importing user data (XLS/CSV/TSV format)
 * Works with Modal.js for consistent SweetAlert2 integration
 * 
 * Usage:
 *   import { showImportModal } from './modals/ImportModal.js';
 *   await showImportModal('siswa', { onConfirm: handleImport });
 */

import { ensureSwalInstance } from '../utils/Toast.js';
import { showCustomModal } from '../utils/Modal.js';

/**
 * Generate import modal HTML content
 * @param {string} role - Role being imported (siswa, guru, mitra)
 * @returns {string} HTML content for the modal
 */
function generateImportHTML(role = 'siswa') {
  const roleDisplay = {
    siswa: 'Siswa',
    guru: 'Guru',
    mitra: 'Mitra'
  }[role] || 'User';

  return `
    <div class="import-modal-wrapper">
      <!-- Template Download Section -->
      <div class="import-section">
        <div class="import-section__header">
          <i class="fas fa-download text-blue-400"></i>
          <span class="font-medium text-sm">Download Template</span>
        </div>
        <p class="text-xs text-gray-400 mb-3">Download template format TSV untuk import (tab-separated)</p>
        <button id="download-template-btn" class="w-full btn btn-red text-xs py-2">
          <i class="fas fa-file-pdf mr-1 text-red-400"></i>Download Template PDF
        </button>
      </div>

      <!-- File Upload Section -->
      <div class="import-section">
        <div class="import-section__upload">
          <input type="file" id="import-file-input" accept=".xls,.xlsx,.csv,text/tab-separated-values" class="hidden">
          <label for="import-file-input" class="cursor-pointer flex flex-col items-center gap-2 w-full h-24">
            <i class="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
            <div class="text-center">
              <p class="text-sm font-medium">Pilih atau drop XLS file</p>
              <p class="text-xs text-gray-500">Max 5MB</p>
            </div>
          </label>
          
          <!-- File Preview -->
          <div id="file-preview" class="mt-3 hidden">
            <div class="text-xs text-gray-400 mb-1">Preview (max 5 rows):</div>
            <div id="preview-table" class="max-h-24 overflow-y-auto bg-white/5 rounded text-xs"></div>
          </div>
        </div>
        
        <div id="import-info" class="text-xs text-gray-400 hidden mt-2">
          <i class="fas fa-info-circle mr-1"></i>
          Header Wajib: nis/nama/kelas/etc.
        </div>
      </div>
    </div>
  `;
}

/**
 * Show import modal with file handling
 * @param {string} role - Role being imported (siswa, guru, mitra)
 * @param {Object} options - { onConfirm, onCancel, onDownload }
 * @returns {Promise<Object>} Modal result
 */
export async function showImportModal(role = 'siswa', options = {}) {
  const {
    onConfirm = null,
    onCancel = null,
    onDownload = null
  } = options;

  const roleDisplay = {
    siswa: 'Siswa',
    guru: 'Guru',
    mitra: 'Mitra'
  }[role] || 'User';

  const result = await showCustomModal({
    title: `Import ${roleDisplay} XLS`,
    html: generateImportHTML(role),
    confirmButtonText: 'Import Data',
    cancelButtonText: 'Batal',
    showCancelButton: true,
    allowEscapeKey: true,
    allowOutsideClick: false,
    didOpen: (modal) => {
      setupImportHandlers(role, modal, {
        onDownload,
        onFileChange: () => updateConfirmButton(modal)
      });
    },
    preConfirm: async () => {
      const swal = ensureSwalInstance();
      const file = document.getElementById('import-file-input')?.files?.[0];
      if (!file) {
        return swal.showValidationMessage('Silakan pilih file untuk diimport');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        return swal.showValidationMessage('File terlalu besar (max 5MB)');
      }
      
      return { file, role };
    }
  });

  if (result.isConfirmed && onConfirm) {
    await onConfirm(result.value);
  } else if (result.isDismissed && onCancel) {
    onCancel();
  }

  return result;
}

/**
 * Setup event handlers for import modal
 * @private
 */
function setupImportHandlers(role, modal, callbacks = {}) {
  const fileInput = document.getElementById('import-file-input');
  const downloadBtn = document.getElementById('download-template-btn');

  // File upload handler
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFilePreview(file, role);
        callbacks.onFileChange?.();
      }
    });

    // Drag and drop support
    const uploadArea = document.querySelector('.import-section__upload');
    if (uploadArea) {
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-400');
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-blue-400');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-400');
        const files = e.dataTransfer?.files;
        if (files?.[0]) {
          fileInput.files = files;
          handleFilePreview(files[0], role);
          callbacks.onFileChange?.();
        }
      });
    }
  }

  // Download template handler
  if (downloadBtn && callbacks.onDownload) {
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await callbacks.onDownload(role);
    });
  }
}

/**
 * Handle file preview - parse and display first 5 rows
 * @private
 */
async function handleFilePreview(file, role) {
  // Dynamically import XLSX library
  if (!window.XLSX) {
    console.error('XLSX library not loaded');
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = window.XLSX.utils.sheet_to_json(worksheet);

    // Show preview
    const previewTable = document.getElementById('preview-table');
    const filePreview = document.getElementById('file-preview');

    if (previewTable && filePreview) {
      const rows = data.slice(0, 5);
      const headers = Object.keys(data[0] || {});

      let html = '<div class="overflow-x-auto"><table class="w-full"><thead>';
      
      // Headers
      html += '<tr class="bg-blue-500/20">';
      headers.forEach(header => {
        html += `<th class="px-2 py-1 text-left text-xs font-500">${header}</th>`;
      });
      html += '</tr></thead><tbody>';

      // Rows
      rows.forEach((row, idx) => {
        html += `<tr class="${idx % 2 === 0 ? 'bg-white/5' : ''}">`;
        headers.forEach(header => {
          html += `<td class="px-2 py-1 text-xs">${row[header] || '-'}</td>`;
        });
        html += '</tr>';
      });

      html += '</tbody></table></div>';
      previewTable.innerHTML = html;
      filePreview.classList.remove('hidden');
    }

    // Show info message
    const importInfo = document.getElementById('import-info');
    if (importInfo) {
      const headerList = headers.join(', ');
      importInfo.innerHTML = `<i class="fas fa-check-circle text-green-400 mr-1"></i>Headers: ${headerList}`;
      importInfo.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error previewing file:', error);
    const importInfo = document.getElementById('import-info');
    if (importInfo) {
      importInfo.innerHTML = `<i class="fas fa-exclamation-triangle text-yellow-400 mr-1"></i>Error reading file: ${error.message}`;
      importInfo.classList.remove('hidden');
    }
  }
}

/**
 * Update confirm button state based on file selection
 * @private
 */
function updateConfirmButton(modal) {
  const fileInput = document.getElementById('import-file-input');
  const confirmBtn = modal.querySelector('.swal2-confirm');

  if (fileInput?.files?.length > 0 && confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

export default {
  showImportModal
};
