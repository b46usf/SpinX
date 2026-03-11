
/**
 * Role Fields Configuration
 * Defines which fields are visible for each role
 */

export const RoleFields = {
  mapping: {
    siswa: ['nis-field', 'nama-field', 'kelas-field', 'sekolah-field-siswa'],
    guru: ['kode-guru-field', 'nama-field', 'kelas-field-guru', 'sekolah-field-guru'],
    mitra: ['mitra-fields'],
    'admin-system': ['nama-field'] // Admin system only needs nama field (noWa is always visible)
  },

  getFieldsForRole(role) {
    return this.mapping[role] || [];
  },

  getAllFields() {
    return Object.values(this.mapping).flat();
  }
};


