/**
 * Import Modal Template - Pure HTML + Setup Functions
 * Extracted from ImportModal.js - Pure template + handlers
 * Usage: generateImportHTML(role), setupImportHandlers(modal, callbacks)
 */

import { sanitizeHtml } from '../utils/modalUtils.js';

/**
 * Generate import modal HTML content (pure function)
 * @param {string} role - Role being imported (siswa, guru, mitra)
 * @returns {string} Safe HTML content
 */
export function generateImportHTML(role = 'siswa') {
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
 * Setup event handlers for import modal DOM (scoped to didOpen)
 * @param {string} role 
 * @param {Element} modal - Swal popup element
 * @param {Object} callbacks - { onDownload(role), onFileChange() }
 */
export function setupImportHandlers(role, modal, callbacks = {}) {
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
    const uploadArea = modal.querySelector('.import-section__upload');
    if (uploadArea) {
      ['dragover', 'dragleave', 'drop'].forEach(event => {
        uploadArea.addEventListener(event, (e) => {
          e.preventDefault();
          if (event === 'dragover') {
            uploadArea.classList.add('border-blue-400');
          } else {
            uploadArea.classList.remove('border-blue-400');
          }
          if (event === 'drop' && e.dataTransfer?.files?.[0]) {
            fileInput.files = e.dataTransfer.files;
            handleFilePreview(e.dataTransfer.files[0], role);
            callbacks.onFileChange?.();
          }
        });
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
 * Update confirm button state (utility for preConfirm/didOpen)
 * @param {Element} modal 
 */
export function updateConfirmButton(modal) {
  const fileInput = document.getElementById('import-file-input');
  const confirmBtn = modal.querySelector('.swal2-confirm');

  const hasFile = fileInput?.files?.length > 0;
  if (confirmBtn) {
    confirmBtn.disabled = !hasFile;
    if (hasFile) {
      confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
      confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }
}

/**
 * Handle file preview - parse XLSX (scoped, no globals)
 * Note: Requires window.XLSX available
 */
async function handleFilePreview(file, role) {
  if (!window.XLSX) {
    console.error('XLSX library not loaded');
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = window.XLSX.utils.sheet_to_json(worksheet);

    const previewTable = document.getElementById('preview-table');
    const filePreview = document.getElementById('file-preview');
    const importInfo = document.getElementById('import-info');

    if (previewTable && filePreview && data.length > 0) {
      const rows = data.slice(0, 5);
      const headers = Object.keys(data[0]);

      let html = '<div class="overflow-x-auto"><table class="w-full"><thead><tr class="bg-blue-500/20">';
      headers.forEach(header => {
        html += `<th class="px-2 py-1 text-left text-xs font-500">${sanitizeHtml(header)}</th>`;
      });
      html += '</tr></thead><tbody>';

      rows.forEach((row, idx) => {
        html += `<tr class="${idx % 2 === 0 ? 'bg-white/5' : ''}">`;
        headers.forEach(header => {
          html += `<td class="px-2 py-1 text-xs">${sanitizeHtml(row[header] || '-')}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';

      previewTable.innerHTML = html;
      filePreview.classList.remove('hidden');
    }

    if (importInfo && data.length > 0) {
      const headerList = Object.keys(data[0]).join(', ');
      importInfo.innerHTML = `<i class="fas fa-check-circle text-green-400 mr-1"></i>Headers: ${headerList}`;
      importInfo.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error previewing file:', error);
    const importInfo = document.getElementById('import-info');
    if (importInfo) {
      importInfo.innerHTML = `<i class="fas fa-exclamation-triangle text-yellow-400 mr-1"></i>Error: ${sanitizeHtml(error.message)}`;
      importInfo.classList.remove('hidden');
    }
  }
}

export default {
  generateImportHTML,
  setupImportHandlers,
  updateConfirmButton
};

