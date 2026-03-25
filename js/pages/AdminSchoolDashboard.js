/**
 * Admin School Dashboard Module
 * Mobile-first dashboard with bottom navigation for admin-sekolah role
 * Clean, DRY, best practice, modular
 * Filters data by schoolId from authenticated user
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';
import {
  applyTextSkeleton,
  clearTextSkeleton,
  renderListSkeleton,
  renderInfoSkeleton,
  clearContainerSkeleton
} from '../components/utils/DashboardSkeleton.js';

const Toast = new Proxy({}, {
  get(_, prop) {
    if (prop === 'fire') {
      return (...args) => window.Toast?.Swal?.fire?.(...args);
    }

    const value = window.Toast?.[prop];
    return typeof value === 'function' ? value.bind(window.Toast) : value;
  }
});

class AdminSchoolDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.currentUser = null;
    this.schoolId = null;
    this.currentImportRole = 'siswa';
    this.data = {
      stats: {},
      users: { siswa: [], guru: [], mitra: [] },
      rewards: { wheel: [], vouchers: [], history: [] },
      schoolInfo: {}
    };
    this.init();
  }

  async init() {
    const authResult = authGuard.init('admin-sekolah', {
      avatarId: 'user-avatar',
      welcomeId: 'welcome-name'
    });
    if (!authResult) return;

    this.currentUser = authGuard.getUser();
    
    this.schoolId = this.currentUser.schoolId || this.currentUser.sekolah;
    if (!this.schoolId) {
      Toast.error('School ID not found', 'Please contact system admin');
      return;
    }

    themeManager.init();

    this.setupProfile();
    this.setupNavigation();
    this.setupEventListeners();
    this.setCurrentDate();
    this.showInitialSkeletons();
    document.getElementById('school-name').textContent = this.currentUser.schoolName || 'Sekolah';

    await this.loadDashboardData();
    await this.loadAccountData();
  }

  setupProfile() {
    if (!this.currentUser) return;

    const avatar = document.getElementById('user-avatar');
    if (avatar) {
      avatar.src = this.currentUser.picture || this.currentUser.foto || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.name || 'A')}&background=random`;
    }

    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) profileAvatar.src = avatar.src;

    const profileName = document.getElementById('profile-name');
    if (profileName) profileName.textContent = this.currentUser.name || '-';

    const profileEmail = document.getElementById('profile-email');
    if (profileEmail) profileEmail.textContent = this.currentUser.email || '-';
  }

  setupNavigation() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.switchSection(item.dataset.section);
      });
    });
  }

  switchSection(section) {
    this.currentSection = section;

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
      item.classList.toggle('text-indigo-400', item.dataset.section === section);
      item.classList.toggle('text-gray-400', item.dataset.section !== section);
    });

    document.querySelectorAll('.section-content').forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== `section-${section}`); 
    });

    this.loadSectionData(section);
  }

  setupEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    document.querySelectorAll('.user-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchUserTab(btn.dataset.tab));
    });

    document.querySelectorAll('.reward-tab-btn').forEach(buttonEl => {
      buttonEl.addEventListener('click', () => this.switchRewardTab(buttonEl.dataset.tab));
    });

    const userSearch = document.getElementById('user-search');
    if (userSearch) userSearch.addEventListener('input', (e) => this.filterUsers(e.target.value));

    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => this.handleMenuAction(item.dataset.action));
    });

    document.getElementById('add-user-btn')?.addEventListener('click', () => Toast.info('Add User', 'Feature coming soon'));
    
    const importBtn = document.getElementById('import-user-btn');
    if (importBtn) {
      importBtn.dataset.role = 'siswa';
      importBtn.addEventListener('click', (e) => {
        console.log('🚀 Import XLS button clicked!', importBtn.dataset.role);
        try {
          window.dashboard.handleImportUser(importBtn.dataset.role);
        } catch (err) {
          console.error('Import button error:', err);
        }
      });
    }
    
    document.getElementById('close-import-modal')?.addEventListener('click', () => window.dashboard.closeImportModal());
    document.getElementById('cancel-import-btn')?.addEventListener('click', () => window.dashboard.closeImportModal());
    document.getElementById('download-template-btn')?.addEventListener('click', () => window.dashboard.downloadTemplate());
    document.getElementById('import-file-input')?.addEventListener('change', (e) => window.dashboard.handleFilePreview(e.target.files[0]));
    document.getElementById('confirm-import-btn')?.addEventListener('click', () => window.dashboard.confirmImport());
    
    document.getElementById('add-slice-btn')?.addEventListener('click', () => Toast.info('Add Slice', 'Feature coming soon'));
    document.getElementById('add-voucher-btn')?.addEventListener('click', () => Toast.info('Add Voucher', 'Feature coming soon'));
  }

  setCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    }
  }

  showInitialSkeletons() {
    applyTextSkeleton([
      { target: 'stat-siswa', width: '52px' },
      { target: 'stat-spin', width: '64px' },
      { target: 'stat-voucher', width: '58px' },
      { target: 'stat-siswa-aktif', width: '56px' },
      { target: 'stat-guru-aktif', width: '56px' },
      { target: 'stat-mitra-aktif', width: '56px' },
      { target: 'sekolah-nama', width: '52%' },
      { target: 'sekolah-plan', width: '70px' },
      { target: 'sekolah-users', width: '44px' },
      { target: 'sekolah-guru', width: '44px' },
      { target: 'subscription-plan', width: '70px' },
      { target: 'subscription-status', width: '78px' },
      { target: 'subscription-expired', width: '110px' }
    ]);

    renderListSkeleton('top-siswa-list', { items: 4, avatar: 'circle' });
    renderListSkeleton('activity-list', { items: 4, avatar: 'circle', trailing: 'none' });
    renderListSkeleton('siswa-list', { items: 4, avatar: 'circle' });
    renderListSkeleton('guru-list', { items: 3, avatar: 'circle' });
    renderListSkeleton('mitra-list', { items: 3, avatar: 'circle' });
    renderInfoSkeleton('wheel-slices', { rows: 3 });
    renderListSkeleton('voucher-list', { items: 3, avatar: 'square', trailing: 'pill' });
    renderListSkeleton('voucher-history', { items: 3, avatar: 'circle', trailing: 'none' });
  }

  switchUserTab(tab) {
    document.querySelectorAll('.user-tab-btn').forEach(buttonEl => {
      buttonEl.classList.toggle('active', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('bg-purple-500/20', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('text-purple-400', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('bg-white/5', buttonEl.dataset.tab !== tab);
      buttonEl.classList.toggle('text-gray-400', buttonEl.dataset.tab !== tab);
    });

    document.querySelectorAll('.user-list-content').forEach(list => {
      list.classList.toggle('hidden', list.id !== `user-list-${tab}`);
    });

    // Update import button role
    const importBtn = document.getElementById('import-user-btn');
    if (importBtn) importBtn.dataset.role = tab;
  }

  switchRewardTab(tab) {
    document.querySelectorAll('.reward-tab-btn').forEach(buttonEl => {
      buttonEl.classList.toggle('active', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('bg-purple-500/20', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('text-purple-400', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('bg-white/5', buttonEl.dataset.tab !== tab);
      buttonEl.classList.toggle('text-gray-400', buttonEl.dataset.tab !== tab);
    });

    document.querySelectorAll('.reward-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `reward-${tab}`);
    });
  }

  filterUsers(query) {
    const currentTab = document.querySelector('.user-tab-btn.active')?.dataset.tab || 'siswa';
    const users = this.data.users[currentTab] || [];
    const normalizedQuery = (query || '').trim().toLowerCase();
    const filtered = !normalizedQuery
      ? users
      : users.filter(user => this.getUserSearchText(user).includes(normalizedQuery));
    this.renderUserList(currentTab, filtered);
  }

  showImportModal(role = 'siswa') {
    this.currentImportRole = role;
    const modal = document.getElementById('import-modal');
    if (!modal) {
      console.error('❌ Import modal not found!');
      return;
    }
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.getElementById('import-title').textContent = `Import ${role === 'siswa' ? 'Siswa' : role === 'guru' ? 'Guru' : 'Mitra'} XLS`;
    document.getElementById('import-file-input').value = '';
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('confirm-import-btn').disabled = true;
    this.initPDFCheck();
  }

  closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

async checkPDFReady(maxAttempts = 50) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      attempts++;

      const jsPDF =
        window.jspdf?.jsPDF ||
        window.jsPDF;

      const hasAutoTable =
        jsPDF &&
        typeof jsPDF === "function" &&
        jsPDF.API &&
        typeof jsPDF.API.autoTable === "function";

      console.log(`PDF check #${attempts}`, {
        jsPDF: !!jsPDF,
        autoTable: !!hasAutoTable
      });

      if (hasAutoTable) {
        resolve(true);
      } else if (attempts >= maxAttempts) {
        reject(new Error("PDF plugins failed to load"));
      } else {
        setTimeout(check, 200);
      }
    };

    check();
  });
}

  initPDFCheck() {
    const btn = document.getElementById('download-template-btn');
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Loading PDF...';
    
    this.checkPDFReady().then(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-file-pdf mr-1 text-red-400"></i>Download Template PDF';
      console.log('✅ PDF plugins ready');
    }).catch((err) => {
      console.error('❌ PDF init failed:', err);
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-exclamation-triangle mr-1 text-yellow-400"></i>PDF Error - Reload';
      btn.onclick = () => window.location.reload();
    });
  }

  async downloadTemplate() {
    const btn = document.getElementById('download-template-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Generating...';

    try {
      await this.checkPDFReady(10);
      
      const { jsPDF } = window.jspdf || window;
      if (!jsPDF) throw new Error('jsPDF not found');
      
      const doc = new jsPDF();
      const schoolId = this.schoolId || 'SCHOOL_ID';
      const role = this.currentImportRole;
      let filename, title, startY = 35;

      if (role === 'guru') {
        // Title
        doc.setFontSize(18);
        doc.text('SPINX GURU IMPORT TEMPLATE', 105, startY, { align: 'center' });
        startY += 15;

        // Tabel 1: Mapel Reference
        doc.setFontSize(12);
        doc.text('1. DAFTAR MAPEL (Reference)', 20, startY);
        startY += 8;

        const mapelHeaders = [['kode_mapel', 'nama_mapel']];
        const mapelData = [
          ['MAT', 'MATEMATIKA'],
          ['BIG', 'BAHASA INGGRIS'],
          ['PJOK', 'PENDIDIKAN JASMANI OLAHRAGA KEBUGARAN'],
          ['PKN', 'PENDIDIKAN KEWARGANEGARAAN'],
          ['BK', 'BIMBINGAN KONSELING'],
          ['EKO', 'EKONOMI'],
          ['BIN', 'BAHASA INDONESIA'],
          ['SENI', 'SENI'],
          ['KIM', 'KIMIA'],
          ['PAI', 'PENDIDIKAN AGAMA ISLAM'],
          ['BIO', 'BIOLOGI'],
          ['SEJ', 'SEJARAH'],
          ['ANTRO', 'ANTROPOLOGI'],
          ['GEO', 'GEOGRAFI'],
          ['PAKr', 'PENDIDIKAN AGAMA KRISTEN'],
          ['SOS', 'SOSIOLOGI'],
          ['TIK', 'INFORMATIKA'],
          ['MAND', 'MANDARIN'],
          ['BHR', 'BAHARI'],
          ['PAH', 'PENDIDIKAN AGAMA HINDU'],
          ['PAK', 'PENDIDIKAN AGAMA KATHOLIK'],
          ['BJW', 'BAHASA JAWA'],
          ['FIS', 'FISIKA'],
          ['PKWU', 'PENDIDIKAN KEWIRAUSAHAAN']
        ];

        doc.autoTable({
          startY,
          head: mapelHeaders,
          body: mapelData,
          styles: { fontSize: 7, cellPadding: 2, halign: 'left' },
          headStyles: { fillColor: [75, 192, 192], fontSize: 8, fontStyle: 'bold' },
          margin: { left: 15, right: 15 },
          tableWidth: 'auto',
          columnStyles: { 0: { cellWidth: 25 } }
        });
        startY = doc.lastAutoTable.finalY + 10;

        // Instruction
        doc.setFontSize(10);
        doc.text('Gunakan kode_mapel dari tabel atas pada kolom kode_mapel', 20, startY);
        startY += 12;

        // Tabel 2: Guru Format
        doc.setFontSize(12);
        doc.text('2. FORMAT GURU (TSV - Tab Separated)', 20, startY);
        startY += 8;

        const guruHeaders = [['kode_guru', 'nama', 'kode_mapel', 'asal_sekolah']];
        const guruExample = ['K1', 'RR Amadani, S.Pd', 'FIS', schoolId];

        doc.autoTable({
          startY,
          head: guruHeaders,
          body: [guruExample],
          styles: { fontSize: 8, cellPadding: 3, halign: 'left', valign: 'middle' },
          headStyles: { fillColor: [54, 162, 235], fontSize: 9, fontStyle: 'bold' },
          margin: { left: 15, right: 15 },
          tableWidth: 'auto'
        });

        filename = `guru_template_${new Date().toISOString().slice(0,10)}.pdf`;
        Toast.success('Template Guru Downloaded', `${mapelData.length} mapel + format guru ready`);
      } else if (role === 'mitra') {
        doc.setFontSize(18);
        doc.text('SPINX MITRA IMPORT TEMPLATE', 105, startY, { align: 'center' });
        startY += 15;

        doc.setFontSize(12);
        doc.text('FORMAT MITRA (TSV - Tab Separated)', 20, startY);
        startY += 8;

        const mitraHeaders = [['mitra_id', 'nama_mitra', 'owner_name', 'email', 'no_wa', 'alamat', 'kategori', 'asal_sekolah']];
        const mitraExample = ['m-001', 'warung bu bos', 'bu bosi', 'example@gmail.com', '08123456789', 'jl manalagi', 'FNB', schoolId];

        doc.autoTable({
          startY,
          head: mitraHeaders,
          body: [mitraExample],
          styles: { fontSize: 8, cellPadding: 3, halign: 'left', valign: 'middle' },
          headStyles: { fillColor: [75, 192, 192], fontSize: 9, fontStyle: 'bold' },
          margin: { left: 15, right: 15 },
          tableWidth: 'auto',
          columnStyles: { 1: { cellWidth: 35 }, 4: { cellWidth: 35 } }
        });

        startY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text('Kategori Contoh: FNB, Snack, Minuman, Toko Buku, Fotokopi', 20, startY);
        
        filename = `mitra_template_${new Date().toISOString().slice(0,10)}.pdf`;
        Toast.success('Template Mitra Downloaded', 'Full mitra format ready');
      } else {
        // Siswa default
        doc.setFontSize(16);
        doc.text('SPINX SISWA IMPORT TEMPLATE', 105, 25, { align: 'center' });

        doc.setFontSize(11);
        doc.text('TSV Format (Tab Separated)', 20, 42);
        doc.text('Example:', 20, 52);

        const headers = [['nis', 'nama', 'jenis_kelamin', 'kelas', 'tahun_ajaran', 'asal_sekolah']];
        const exampleRow = ['13005', 'AGHA MUGIONO', 'L', 'x-1', '2025/2026', schoolId];

        doc.autoTable({
          startY: 60,
          head: headers,
          body: [exampleRow],
          styles: { fontSize: 8, cellPadding: 3, halign: 'left', valign: 'middle' },
          headStyles: { fillColor: [54, 162, 235], fontSize: 9, fontStyle: 'bold' },
          columnStyles: { 1: { cellWidth: 50 } },
          margin: { left: 15, right: 15 },
          tableWidth: 'auto'
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(9);
        doc.text('Notes:', 20, finalY);
        doc.setFontSize(8);
        doc.text('• Use this exact table format in TSV', 25, finalY + 8);
        doc.text('• asal_sekolah auto-filled', 25, finalY + 16);

        filename = `siswa_template_${new Date().toISOString().slice(0,10)}.pdf`;
        Toast.success('PDF Template Downloaded', `siswa_template_${schoolId}.pdf ready`);
      }

      doc.save(filename);

    } catch (error) {
      console.error('PDF generation failed:', error);
      Toast.error('PDF Error', 'Plugin failed to load. Try refresh (F5)');
      
      // Fallback JSON
      const fallbackData = role === 'guru' ? {
        mapel: [
          {kode_mapel: 'MAT', nama_mapel: 'MATEMATIKA'},
          // ... abbreviated
        ],
        headers: ['kode_guru', 'nama', 'kode_mapel', 'asal_sekolah'],
        example: ['K1', 'ROSYIDAH ROHMAH, S.Pd', 'FIS', schoolId]
      } : {
        headers: ['nis', 'nama', 'jenis_kelamin', 'kelas', 'tahun_ajaran', 'asal_sekolah'],
        example: ['13925', 'AGHASA ZEYNA PUTRI MUGIONO', 'P', 'x-1', '2025/2026', schoolId]
      };
      const blob = new Blob([JSON.stringify(fallbackData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${role}_template_fallback.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => this.initPDFCheck(), 1000);
    }
  }

async handleFilePreview(file) {
  if (!file) return;

  try {
    const rows = await this.parseFile(file);
    const preview = rows.slice(0, 5);

    const html = preview.map(row => `
      <div class="grid grid-cols-6 gap-1 p-1 bg-white/10 rounded mb-1">
        ${Object.values(row).slice(0,6).map(v => `<div class="text-xs">${v}</div>`).join('')}
      </div>
    `).join('');

    document.getElementById('preview-table').innerHTML = html;
    document.getElementById('file-preview').classList.remove('hidden');
    document.getElementById('confirm-import-btn').disabled = false;

  } catch (e) {
    Toast.error('Preview gagal', 'File tidak valid');
  }
}

async parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') {
    return this.parseExcel(file);
  }

  return this.parseText(file);
}

async parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellText: true, cellDates: false });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
          defval: '',
          blankrows: false
        });

        resolve(this.rowsToObjects(rows));
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

async parseText(file) {
  const text = await file.text();
  const rows = text
    .split(/\r?\n/)
    .map(row => row.split(/\t|,/))
    .filter(row => row.some(cell => this.normalizeImportValue(cell) !== ''));

  return this.rowsToObjects(rows);
}

normalizeImportHeader(header) {
  return (header ?? '')
    .toString()
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

normalizeImportValue(value) {
  return value == null ? '' : value.toString().trim();
}

rowsToObjects(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const [rawHeaders = [], ...bodyRows] = rows;
  const headers = rawHeaders.map((header, index) => {
    const normalized = this.normalizeImportHeader(header);
    return normalized || `column_${index + 1}`;
  });

  return bodyRows
    .map(row => headers.reduce((obj, header, index) => {
      obj[header] = this.normalizeImportValue(row?.[index]);
      return obj;
    }, {}))
    .filter(row => !this.isImportRowEmpty(row));
}

isImportRowEmpty(row) {
  return Object.values(row).every(value => this.normalizeImportValue(value) === '');
}

normalizeData(rows, role) {
  return rows.map(r => {
    if (role === 'guru') {
      return {
        kode_guru: r.kode_guru || r.KODE_GURU,
        nama: r.nama,
        kode_mapel: r.kode_mapel,
        asal_sekolah: this.schoolId
      };
    }

    if (role === 'mitra') {
      return {
        mitra_id: r.mitra_id,
        nama_mitra: r.nama_mitra,
        owner_name: r.owner_name,
        email: r.email,
        no_wa: r.no_wa,
        alamat: r.alamat,
        kategori: r.kategori,
        asal_sekolah: this.schoolId
      };
    }

    // default siswa
    return {
      nis: r.nis,
      nama: r.nama,
      jenis_kelamin: r.jenis_kelamin,
      kelas: r.kelas,
      tahun_ajaran: r.tahun_ajaran,
      asal_sekolah: this.schoolId
    };
  });
}

async confirmImport() {
  const file = document.getElementById('import-file-input').files[0];
  if (!file) {
    Toast.warning('Pilih File', 'Upload Excel/CSV');
    return;
  }

  const role = this.currentImportRole;

  Toast.loading(`Import ${role}...`);

  try {
    const rawData = await this.parseFile(file);

    if (!rawData || rawData.length === 0) {
      Toast.warning('Kosong', 'File tidak ada data');
      return;
    }

    const data = this.normalizeData(rawData, role);

    let endpoint = {
      siswa: 'importstudentsmaster',
      guru: 'importgurumaster',
      mitra: 'importmitramaster'
    }[role];

    const payload = { schoolId: this.schoolId };
    payload[role === 'siswa' ? 'students' : role === 'guru' ? 'teachers' : 'mitras'] = data;

    const result = await authApi.call(endpoint, payload);

    if (result.success) {
      const processed = result.stats?.total ?? data.length;
      const notes = [];
      if (result.stats?.skipped) notes.push(`${result.stats.skipped} baris kosong/tidak valid`);
      if (result.stats?.duplicates) notes.push(`${result.stats.duplicates} duplikat`);
      this.closeImportModal();
      await this.loadUsers(role);
      Toast.success('Import berhasil', notes.length ? `${processed} data tersimpan, ${notes.join(', ')}` : `${processed} data tersimpan`);
    } else {
      Toast.error('Import gagal', result.error);
    }

  } catch (err) {
    console.error(err);
    Toast.error('Error', 'Format file salah / corrupt');
  }
}

handleImportUser(role) {
    document.getElementById('import-user-btn').dataset.role = role;
    this.showImportModal(role);
  }

  handleMenuAction(action) {
    switch (action) {
      case 'logo':
        Toast.info('Logo Sekolah', 'Upload logo sekolah');
        break;
      case 'settings':
        Toast.info('Pengaturan', 'Konfigurasi sekolah');
        break;
    }
  }

  handleLogout() {
    Toast.fire({
      title: 'Logout?',
      text: 'Apakah Anda yakin?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) authGuard.logout();
    });
  }

  async loadSectionData(section) {
    switch (section) {
      case 'users':
        if (!Object.values(this.data.users || {}).some(list => Array.isArray(list) && list.length > 0)) {
          await this.loadUsers();
        }
        break;
      case 'reward':
        if (this.data.rewards.wheel.length === 0) await this.loadRewards();
        break;
    }
  }

  async loadDashboardData() {
    applyTextSkeleton([
      { target: 'stat-siswa', width: '52px' },
      { target: 'stat-spin', width: '64px' },
      { target: 'stat-voucher', width: '58px' }
    ]);
    renderListSkeleton('top-siswa-list', { items: 4, avatar: 'circle' });
    renderListSkeleton('activity-list', { items: 4, avatar: 'circle', trailing: 'none' });

    try {
      const payload = { schoolId: this.schoolId, action: 'getschoolstats' };
      const result = await authApi.call('getschoolstats', payload, false);
      const hasFallbackData = Boolean(result?.data || result?.topStudents || result?.activities || result?.userStats);

      if (result?.success || hasFallbackData) {
        this.data.stats = result.data || {};
        this.updateDashboardStats();
        this.renderTopStudents(result.topStudents || []);
        this.renderRecentActivity(result.activities || []);
        this.updateUserStats(result.userStats || {});
      } else {
        this.data.stats = {};
        this.updateDashboardStats();
        this.renderTopStudents([]);
        this.renderRecentActivity([]);
        this.updateUserStats({});
      }
    } catch (error) {
      console.error('Load stats error:', error);
      this.data.stats = {};
      this.updateDashboardStats();
      this.renderTopStudents([]);
      this.renderRecentActivity([]);
      this.updateUserStats({});
      Toast.error('Connection error', 'Please check your connection');
    }
  }

  updateDashboardStats() {
    const stats = this.data.stats || {};
    clearTextSkeleton(['stat-siswa', 'stat-spin', 'stat-voucher']);
    document.getElementById('stat-siswa').textContent = stats.siswa || stats.students || 0;
    document.getElementById('stat-spin').textContent = stats.spinsToday || stats.spinToday || 0;
    document.getElementById('stat-voucher').textContent = stats.vouchers || stats.voucher || 0;
  }

  updateUserStats(stats) {
    clearTextSkeleton(['stat-siswa-aktif', 'stat-guru-aktif', 'stat-mitra-aktif']);
    document.getElementById('stat-siswa-aktif').textContent = stats.siswaAktif || 0;
    document.getElementById('stat-guru-aktif').textContent = stats.guruAktif || 0;
    document.getElementById('stat-mitra-aktif').textContent = stats.mitraAktif || 0;
  }

  renderTopStudents(students) {
    const container = document.getElementById('top-siswa-list');
    if (!container) return;
    clearContainerSkeleton(container);

    if (students.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-trophy text-lg mb-2"></i><p class="text-xs">Belum ada data</p></div>';
      return;
    }

    container.innerHTML = students.slice(0, 5).map((student, idx) => `
      <div class="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold">${idx + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-xs">${student.name}</div>
          <div class="text-xs text-gray-500">${student.kelas}</div>
        </div>
        <div class="text-xs text-purple-400 font-medium">${student.spins || 0} spin</div>
      </div>
    `).join('');
  }

  renderRecentActivity(activities) {
    const container = document.getElementById('activity-list');
    if (!container) return;
    clearContainerSkeleton(container);

    if (activities.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-history text-lg mb-2"></i><p class="text-xs">Belum ada aktivitas</p></div>';
      return;
    }

    container.innerHTML = activities.slice(0, 10).map(activity => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full ${this.getRoleColor(activity.role)} flex items-center justify-center">
          <i class="fas fa-user text-xs"></i>
        </div>
        <div class="flex-1">
          <div class="font-medium text-xs">${activity.name || activity.email}</div>
          <div class="text-xs text-gray-500">${activity.action}</div>
        </div>
        <div class="text-xs text-gray-500">${this.formatTimeAgo(new Date(activity.timestamp))}</div>
      </div>
    `).join('');
  }

  normalizeUserGroups(result) {
    if (result?.data && !Array.isArray(result.data)) {
      return {
        siswa: Array.isArray(result.data.siswa) ? result.data.siswa : [],
        guru: Array.isArray(result.data.guru) ? result.data.guru : [],
        mitra: Array.isArray(result.data.mitra) ? result.data.mitra : []
      };
    }

    const users = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.users)
        ? result.users
        : [];

    const grouped = { siswa: [], guru: [], mitra: [] };
    users.forEach(user => {
      const role = user.role || 'siswa';
      if (grouped[role]) grouped[role].push(user);
    });
    return grouped;
  }

  getUserSearchText(user) {
    return [
      user.name,
      user.nama,
      user.email,
      user.no_wa,
      user.noWa,
      user.nis,
      user.kelas,
      user.kode_guru,
      user.kode_mapel,
      user.mitra_id,
      user.owner_name,
      user.kategori
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  getUserSecondaryText(role, user) {
    if (role === 'siswa') {
      return [`NIS ${user.nis || user.id || '-'}`, user.kelas || '-', user.tahun_ajaran || '']
        .filter(Boolean)
        .join(' • ');
    }

    if (role === 'guru') {
      return [user.kode_guru || user.id || '-', user.kode_mapel || 'Mapel belum diisi']
        .filter(Boolean)
        .join(' • ');
    }

    return [
      user.owner_name ? `Owner: ${user.owner_name}` : '',
      user.no_wa || user.email || '',
      user.kategori || ''
    ]
      .filter(Boolean)
      .join(' • ');
  }

  async loadUsers(preferredTab) {
    renderListSkeleton('siswa-list', { items: 4, avatar: 'circle' });
    renderListSkeleton('guru-list', { items: 3, avatar: 'circle' });
    renderListSkeleton('mitra-list', { items: 3, avatar: 'circle' });

    try {
      let result = await authApi.call('getschoolmasterusers', { schoolId: this.schoolId }, false);
      if (!result?.success) {
        result = await authApi.call('getschoolusers', { schoolId: this.schoolId, role: '' }, false);
      }

      if (result.success) {
        const grouped = this.normalizeUserGroups(result);
        this.data.users = grouped;

        this.renderUserList('siswa', grouped.siswa);
        this.renderUserList('guru', grouped.guru);
        this.renderUserList('mitra', grouped.mitra);
        this.switchUserTab(preferredTab || document.querySelector('.user-tab-btn.active')?.dataset.tab || 'siswa');
      } else {
        // Even on !success, init empty grouped data
        this.data.users = { siswa: [], guru: [], mitra: [] };
        this.renderUserList('siswa', []);
        this.renderUserList('guru', []);
        this.renderUserList('mitra', []);
      }
    } catch (error) {
      console.error('Load users error:', error);
      // Ensure data.users always initialized
      this.data.users = { siswa: [], guru: [], mitra: [] };
      this.renderUserList('siswa', []);
      this.renderUserList('guru', []);
      this.renderUserList('mitra', []);
    }
  }

  renderUserList(role, users) {
    const containerId = `${role}-list`;
    const container = document.getElementById(containerId);
    if (!container) return;
    clearContainerSkeleton(container);

    if (users.length === 0) {
      container.innerHTML = '<div class="text-center py-6 text-gray-500"><i class="fas fa-users text-xl mb-2"></i><p class="text-sm">Belum ada data</p></div>';
      return;
    }

    container.innerHTML = users.map(user => `
      <div class="glass-card p-3 flex items-center gap-3 hover:bg-white/10">
        <img src="${user.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.nama || user.nama_mitra || 'U')}`}" class="w-10 h-10 rounded-full">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${user.name || user.nama || user.nama_mitra || '-'}</div>
          <div class="text-xs text-gray-500">${this.getUserSecondaryText(role, user) || '-'}</div>
        </div>
        <span class="badge badge-primary text-xs">${(user.status || 'active') === 'active' ? 'Aktif' : 'Nonaktif'}</span>
      </div>
    `).join('');
  }

  async loadRewards() {
    document.getElementById('wheel-slices').innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-sliders-h text-lg mb-2"></i><p class="text-xs">Konfigurasi reward belum tersedia</p></div>';
    document.getElementById('voucher-list').innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-ticket-alt text-lg mb-2"></i><p class="text-xs">Data voucher belum tersedia</p></div>';
    document.getElementById('voucher-history').innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-history text-lg mb-2"></i><p class="text-xs">Riwayat voucher belum tersedia</p></div>';
  }

  async loadAccountData() {
    applyTextSkeleton([
      { target: 'sekolah-nama', width: '52%' },
      { target: 'sekolah-plan', width: '70px' },
      { target: 'sekolah-users', width: '44px' },
      { target: 'sekolah-guru', width: '44px' },
      { target: 'subscription-plan', width: '70px' },
      { target: 'subscription-status', width: '78px' },
      { target: 'subscription-expired', width: '110px' }
    ]);

    try {
      const result = await authApi.call('checksubscription', { schoolId: this.schoolId }, false);

      if (result.success && result.school) {
        this.data.schoolInfo = result.school;
        this.updateSchoolInfo();
      } else {
        clearTextSkeleton([
          'sekolah-nama',
          'sekolah-plan',
          'sekolah-users',
          'sekolah-guru',
          'subscription-plan',
          'subscription-status',
          'subscription-expired'
        ]);
      }
    } catch (error) {
      console.error('Load school info error:', error);
      clearTextSkeleton([
        'sekolah-nama',
        'sekolah-plan',
        'sekolah-users',
        'sekolah-guru',
        'subscription-plan',
        'subscription-status',
        'subscription-expired'
      ]);
    }
  }

  updateSchoolInfo() {
    const info = this.data.schoolInfo;
    if (!info) return;

    clearTextSkeleton([
      'sekolah-nama',
      'sekolah-plan',
      'sekolah-users',
      'sekolah-guru',
      'subscription-plan',
      'subscription-status',
      'subscription-expired'
    ]);

    document.getElementById('sekolah-nama').textContent = info.schoolName || info.name || '-';
    document.getElementById('sekolah-plan').textContent = info.plan?.toUpperCase() || '-';
    document.getElementById('sekolah-users').textContent = info.currentUsers || 0;
    document.getElementById('sekolah-guru').textContent = 'N/A';
    document.getElementById('subscription-plan').textContent = info.plan?.toUpperCase() || '-';
    document.getElementById('subscription-status').textContent = info.status === 'active' ? 'Aktif' : 'Expired';
    document.getElementById('subscription-expired').textContent = info.expiresAt ? new Date(info.expiresAt).toLocaleDateString('id-ID') : 'Forever';
  }

  getRoleColor(role) {
    const colors = {
      'siswa': 'bg-blue-500/20 text-blue-400',
      'guru': 'bg-green-500/20 text-green-400',
      'mitra': 'bg-purple-500/20 text-purple-400'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400';
  }

  formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru';
    return `${diffMins}m ago`;
  }
}

// Export and auto-init
export { AdminSchoolDashboard };

document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new AdminSchoolDashboard();
  
  ['handleImportUser', 'closeImportModal', 'downloadTemplate', 'handleFilePreview', 'confirmImport'].forEach(method => {
    window.dashboard[method] = window.dashboard[method].bind(window.dashboard);
  });

  window.startGame = () => Toast.info('Game', 'Student game interface');
  window.spinWheel = () => Toast.info('Wheel', 'Configure wheel first');
});

