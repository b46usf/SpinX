// DRY role utilities
export const ROLE_CONFIG = {
  siswa: {
    color: 'bg-blue-500/20 text-blue-400',
    icon: 'fa-user-graduate',
    secondary(user) {
      return [`NIS ${user.nis || user.id || '-'}`, user.kelas || '-', user.tahun_ajaran || ''].filter(Boolean).join(' • ');
    }
  },
  guru: {
    color: 'bg-green-500/20 text-green-400',
    icon: 'fa-chalkboard-teacher',
    secondary(user) {
      return [user.kode_guru || user.id || '-', user.kode_mapel || 'Mapel belum diisi'].filter(Boolean).join(' • ');
    }
  },
  mitra: {
    color: 'bg-purple-500/20 text-purple-400',
    icon: 'fa-store',
    secondary(user) {
      return [user.owner_name ? `Owner: ${user.owner_name}` : '', user.no_wa || user.email || '', user.kategori || ''].filter(Boolean).join(' • ');
    }
  }
};

export const getRoleColor = (role) => ROLE_CONFIG[role]?.color || 'bg-gray-500/20 text-gray-400';

export const getUserSecondaryText = (role, user) => ROLE_CONFIG[role]?.secondary(user) || '-';

export const getRoleIcon = (role) => ROLE_CONFIG[role]?.icon || 'fa-user';

export const getUserSearchText = (user = {}) => {
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
};
