
/**
 * Role Fields Configuration
 * Defines which fields are visible for each role
 */

export const RoleFields = {
  mapping: {
    siswa: ['nis-field', 'nama-field', 'kelas-field', 'sekolah-field-siswa'],
    guru: ['kode-guru-field', 'nama-field', 'kelas-field-guru', 'sekolah-field-guru'],
    mitra: ['mitra-fields']
  },

  getFieldsForRole(role) {
    return this.mapping[role] || [];
  },

  getAllFields() {
    return Object.values(this.mapping).flat();
  }
};


