
/**
 * Role Fields Configuration
 * Defines which fields are visible for each role
 */

const RoleFields = {
  mapping: {
    siswa: ['nis-field', 'nama-field', 'kelas-field', 'sekolah-field-siswa'],
    guru: ['sekolah-field'],
    mitra: ['mitra-fields']
  },

  getFieldsForRole(role) {
    return this.mapping[role] || [];
  },

  getAllFields() {
    return Object.values(this.mapping).flat();
  }
};

// Export globally
window.RoleFields = RoleFields;


