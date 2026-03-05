/**
 * Role Fields Configuration
 * Defines which fields are visible for each role
 */

const RoleFields = {
  // Field visibility mapping for each role
  mapping: {
    siswa: ['nis-field', 'nama-field', 'kelas-field', 'sekolah-field-siswa'],
    guru: ['sekolah-field'],
    mitra: ['mitra-fields']
  },

  /**
   * Get field IDs for a specific role
   */
  getFieldsForRole(role) {
    return this.mapping[role] || [];
  },

  /**
   * Get all field IDs across all roles
   */
  getAllFields() {
    return Object.values(this.mapping).flat();
  }
};

// Export for global use
window.RoleFields = RoleFields;

