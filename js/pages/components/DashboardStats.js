// DashboardStats Component - Pure UI (DRY)
import { clearTextSkeleton } from '../../components/utils/DashboardSkeleton.js';

export function renderStats(stats) {
  clearTextSkeleton(['stat-siswa', 'stat-spin', 'stat-voucher']);
  document.getElementById('stat-siswa').textContent = stats.siswa || stats.students || 0;
  document.getElementById('stat-spin').textContent = stats.spinsToday || stats.spinToday || 0;
  document.getElementById('stat-voucher').textContent = stats.vouchers || stats.voucher || 0;
}

export function renderUserStats(stats) {
  clearTextSkeleton(['stat-siswa-aktif', 'stat-guru-aktif', 'stat-mitra-aktif']);
  document.getElementById('stat-siswa-aktif').textContent = stats.siswaAktif || 0;
  document.getElementById('stat-guru-aktif').textContent = stats.guruAktif || 0;
  document.getElementById('stat-mitra-aktif').textContent = stats.mitraAktif || 0;
}

export function renderSchoolInfo(info) {
  clearTextSkeleton(['sekolah-nama', 'sekolah-plan', 'sekolah-users', 'sekolah-guru', 'subscription-plan', 'subscription-status', 'subscription-expired']);
  document.getElementById('sekolah-nama').textContent = info.schoolName || info.name || '-';
  document.getElementById('sekolah-plan').textContent = info.plan?.toUpperCase() || '-';
  document.getElementById('sekolah-users').textContent = info.currentUsers || 0;
  document.getElementById('sekolah-guru').textContent = 'N/A';
  document.getElementById('subscription-plan').textContent = info.plan?.toUpperCase() || '-';
  document.getElementById('subscription-status').textContent = info.status === 'active' ? 'Aktif' : 'Expired';
  document.getElementById('subscription-expired').textContent = info.expiresAt ? new Date(info.expiresAt).toLocaleDateString('id-ID') : 'Forever';
}
