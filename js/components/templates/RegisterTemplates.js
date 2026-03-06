/**
 * Register Form Templates
 * HTML templates for register form fields
 */

export const RegisterTemplates = {
  roleField() {
    return `
      <div class="input-group">
        <label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-user-tag mr-2 text-indigo-400"></i>Saya adalah *</label>
        <select id="role" name="role" required class="select">
          <option value="">Pilih role...</option>
          <option value="siswa">🎓 Siswa</option>
          <option value="guru">👨‍🏫 Guru</option>
          <option value="mitra">🏪 Mitra Kantin</option>
        </select>
      </div>`;
  },

  whatsappField() {
    return `<div class="input-group"><input type="text" id="noWa" name="noWa" required placeholder="Nomor WhatsApp" class="input"><i class="input-icon fas fa-phone"></i></div>`;
  },

  nisField() {
    return `
      <label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-id-card mr-2 text-blue-400"></i>NIS *</label>
      <input type="text" id="nis" name="nis" placeholder="Masukkan NIS Anda" class="input">
      <i class="input-icon fas fa-id-card"></i>
      <button type="button" id="verify-nis-btn" class="btn btn-secondary mt-2 w-full" style="padding:8px 16px;font-size:13px"><i class="fas fa-search"></i> Cek NIS</button>
      <div id="nis-status" class="hidden mt-2 p-2 rounded text-sm"></div>`;
  },

  namaField() {
    return `<label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-user mr-2 text-green-400"></i>Nama</label><input type="text" id="nama" name="nama" readonly placeholder="Nama dari NIS" class="input" style="background:var(--bg-glass-hover)"><i class="input-icon fas fa-user"></i>`;
  },

  kelasField() {
    return `<label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-school mr-2 text-green-400"></i>Kelas</label><input type="text" id="kelas" name="kelas" readonly placeholder="Kelas dari NIS" class="input" style="background:var(--bg-glass-hover)"><i class="input-icon fas fa-door-open"></i>`;
  },

  sekolahSiswaField() {
    return `<label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-building mr-2 text-purple-400"></i>Sekolah</label><input type="text" id="sekolah-siswa" name="sekolah-siswa" readonly placeholder="Sekolah dari NIS" class="input" style="background:var(--bg-glass-hover)"><i class="input-icon fas fa-university"></i>`;
  },

  sekolahGuruField() {
    return `<label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-building mr-2 text-purple-400"></i>Sekolah (Opsional)</label><input type="text" id="sekolah" name="sekolah" placeholder="Nama sekolah" class="input"><i class="input-icon fas fa-university"></i>`;
  },

  mitraFields() {
    return `
      <div class="input-group"><label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-store mr-2 text-orange-400"></i>Nama Toko/UMKM *</label><input type="text" id="namaMitra" name="namaMitra" placeholder="Nama toko Anda" class="input"><i class="input-icon fas fa-shopping-bag"></i></div>
      <div class="input-group"><label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-tags mr-2 text-pink-400"></i>Kategori *</label><select id="kategori" name="kategori" class="select"><option value="">Pilih kategori...</option><option value="makanan">🍔 Makanan</option><option value="minuman">🥤 Minuman</option><option value="jasa">🔧 Jasa</option><option value="lainnya">📦 Lainnya</option></select></div>
      <div class="input-group"><label class="block text-sm font-medium mb-2 text-left"><i class="fas fa-map-marker-alt mr-2 text-red-400"></i>Alamat *</label><textarea id="alamat" name="alamat" placeholder="Alamat toko" class="textarea"></textarea></div>`;
  },

  registerSection() {
    return `
      <div id="register-section" class="hidden glass-card p-8 w-full max-w-md animate-scale-in">
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 via-cyan-500 to-blue-500 flex items-center justify-center animate-float"><i class="fas fa-user-plus text-3xl text-white"></i></div>
          <h2 class="text-2xl font-bold">Daftar Sekarang</h2>
          <p class="text-secondary mt-2 text-sm">Lengkapi data diri Anda</p>
        </div>
        <div class="glass-card p-4 mb-6 flex items-center gap-4">
          <img id="register-avatar" src="" alt="Avatar" class="avatar avatar-sm">
          <div class="text-left"><div id="register-name" class="font-semibold"></div><div id="register-email" class="text-sm text-secondary"></div></div>
        </div>
        <form id="register-form" class="space-y-4">
          ${this.roleField()}
          ${this.whatsappField()}
          <div id="nis-field" class="hidden input-group">${this.nisField()}</div>
          <div id="nama-field" class="hidden input-group">${this.namaField()}</div>
          <div id="kelas-field" class="hidden input-group">${this.kelasField()}</div>
          <div id="sekolah-field-siswa" class="hidden input-group">${this.sekolahSiswaField()}</div>
          <div id="sekolah-field" class="hidden input-group">${this.sekolahGuruField()}</div>
          <div id="mitra-fields" class="hidden space-y-4">${this.mitraFields()}</div>
          <div id="register-error" class="hidden p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"></div>
          <button type="submit" class="btn btn-primary w-full"><i class="fas fa-rocket"></i> Daftar Sekarang</button>
          <button type="button" id="cancel-register" class="btn btn-secondary w-full"><i class="fas fa-arrow-left"></i> Batal</button>
        </form>
      </div>`;
  }
};

