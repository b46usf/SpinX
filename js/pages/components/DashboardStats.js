// DashboardStats Component - Pure UI (DRY)
import { clearTextSkeleton } from '../../components/utils/DashboardSkeleton.js';
import { DOMUtils } from '../../core/DOMUtils.js';

export function renderStats(stats) {
  clearTextSkeleton(['stat-siswa', 'stat-spin', 'stat-voucher']);
  DOMUtils.setText('stat-siswa', stats.siswa || stats.students || 0);
  DOMUtils.setText('stat-spin', stats.spinsToday || stats.spinToday || 0);
  DOMUtils.setText('stat-voucher', stats.vouchers || stats.voucher || 0);
}

export function renderUserStats(stats) {
  clearTextSkeleton(['stat-siswa-aktif', 'stat-guru-aktif', 'stat-mitra-aktif']);
  DOMUtils.setText('stat-siswa-aktif', stats.siswaAktif || 0);
  DOMUtils.setText('stat-guru-aktif', stats.guruAktif || 0);
  DOMUtils.setText('stat-mitra-aktif', stats.mitraAktif || 0);
}

export function renderSchoolInfo(info) {
  clearTextSkeleton(['sekolah-nama', 'sekolah-plan', 'sekolah-users', 'sekolah-guru', 'subscription-plan', 'subscription-status', 'subscription-expired']);
  DOMUtils.setText('sekolah-nama', info.schoolName || info.name || '-');
  DOMUtils.setText('sekolah-plan', info.plan?.toUpperCase() || '-');
  DOMUtils.setText('sekolah-users', info.currentUsers || 0);
  DOMUtils.setText('sekolah-guru', 'N/A');
  DOMUtils.setText('subscription-plan', info.plan?.toUpperCase() || '-');
  DOMUtils.setText('subscription-status', info.status === 'active' ? 'Aktif' : 'Expired');
  DOMUtils.setText('subscription-expired', info.expiresAt ? new Date(info.expiresAt).toLocaleDateString('id-ID') : 'Forever');
}
