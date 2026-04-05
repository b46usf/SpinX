// UserListRenderer - Pure UI renderer (DRY)
import { clearContainerSkeleton } from '../../components/utils/DashboardSkeleton.js';
import { DOMUtils } from '../../core/DOMUtils.js';

export function renderUserList(role, users, getUserSecondaryText, getRoleColor) {
  const containerId = `${role}-list`;
  const container = DOMUtils.getElement(containerId);
  if (!container) return;
  clearContainerSkeleton(container);

  if (users.length === 0) {
    DOMUtils.setHTML(container, '<div class="text-center py-6 text-gray-500"><i class="fas fa-users text-xl mb-2"></i><p class="text-sm">Belum ada data</p></div>');
    return;
  }

  DOMUtils.setHTML(container, users.map(user => `
    <div class="glass-card p-3 flex items-center gap-3 hover:bg-white/10">
      <img src="${user.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.nama || user.nama_mitra || 'U')}`}" class="w-10 h-10 rounded-full">
      <div class="flex-1 min-w-0">
        <div class="font-medium text-sm">${user.name || user.nama || user.nama_mitra || '-'}</div>
        <div class="text-xs text-gray-500">${getUserSecondaryText(role, user) || '-'}</div>
      </div>
      <span class="badge badge-primary text-xs">${(user.status || 'active') === 'active' ? 'Aktif' : 'Nonaktif'}</span>
    </div>
  `).join(''));
}
