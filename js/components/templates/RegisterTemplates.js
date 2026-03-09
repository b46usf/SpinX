
/**
 * Register Form Templates
 * HTML templates for register form - COMPACT & MODERN DESIGN
 */

export const RegisterTemplates = {
  roleField() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-user-tag mr-1 text-indigo-400"></i>Saya adalah *
        </label>
        <select id="role" name="role" required class="select w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
          <option value="">Pilih role...</option>
          <option value="siswa">🎓 Siswa</option>
          <option value="guru">👨‍🏫 Guru</option>
          <option value="mitra">🏪 Mitra Kantin</option>
        </select>
      </div>`;
  },

  whatsappField() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-phone mr-1 text-green-400"></i>WhatsApp *
        </label>
        <div class="relative">
          <input type="text" id="noWa" name="noWa" required placeholder="08xxxxxxxxxx" 
            class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 pl-10">
          <i class="input-icon fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
        </div>
      </div>`;
  },

  nisField() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-id-card mr-1 text-blue-400"></i>NIS *
        </label>
        <div class="relative">
          <input type="text" id="nis" name="nis" placeholder="Masukkan NIS" 
            class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pl-10">
          <i class="input-icon fas fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
        </div>
        <button type="button" id="verify-nis-btn" class="mt-2 w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors">
          <i class="fas fa-search mr-1"></i> Cek NIS
        </button>
        <div id="nis-status" class="hidden mt-2 p-2 rounded-lg text-xs"></div>
      </div>`;
  },

  namaField() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-user mr-1 text-purple-400"></i>Nama
        </label>
        <input type="text" id="nama" name="nama" readonly placeholder="Nama akan diisi otomatis" 
          class="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700 rounded-xl text-gray-400 text-sm cursor-not-allowed">
      </div>`;
  },

  kelasField() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-school mr-1 text-cyan-400"></i>Kelas
        </label>
        <input type="text" id="kelas" name="kelas" readonly placeholder="Kelas akan diisi otomatis" 
          class="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700 rounded-xl text-gray-400 text-sm cursor-not-allowed">
      </div>`;
  },

  sekolahSiswaField() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-building mr-1 text-pink-400"></i>Sekolah
        </label>
        <input type="text" id="sekolah-siswa" name="sekolah-siswa" readonly placeholder="Sekolah akan diisi otomatis" 
          class="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700 rounded-xl text-gray-400 text-sm cursor-not-allowed">
      </div>`;
  },

  sekolahGuruField() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-building mr-1 text-pink-400"></i>Sekolah
        </label>
        <input type="text" id="sekolah-guru" name="sekolah-guru" readonly placeholder="Akan diisi otomatis" 
          class="w-full px-3 py-2.5 bg-gray-800/30 border border-gray-700 rounded-xl text-gray-400 text-sm cursor-not-allowed">
      </div>`;
  },

  kodeGuruField() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-id-card-alt mr-1 text-orange-400"></i>Kode Guru *
        </label>
        <div class="relative">
          <input type="text" id="kode-guru" name="kodeGuru" placeholder="Masukkan Kode Guru" 
            class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 pl-10">
          <i class="input-icon fas fa-id-card-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
        </div>
        <button type="button" id="verify-kode-guru-btn" class="mt-2 w-full py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg text-xs font-medium transition-colors">
          <i class="fas fa-search mr-1"></i> Cek Kode Guru
        </button>
        <div id="kode-guru-status" class="hidden mt-2 p-2 rounded-lg text-xs"></div>
      </div>`;
  },

  kelasFieldGuru() {
    return `
      <div class="input-group">
        <label class="block text-xs font-medium mb-2 text-left text-gray-400">
          <i class="fas fa-users mr-1 text-cyan-400"></i>Kelas (Wali Kelas)
        </label>
        <select id="kelas-guru" name="kelasGuru"
          class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20">
          <option value="">Pilih kelas...</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Pilih "Bukan Walas" jika bukan wali kelas</p>
      </div>`;
  },

  mitraFields() {
    return `
      <div class="space-y-3">
        <div class="input-group">
          <label class="block text-xs font-medium mb-2 text-left text-gray-400">
            <i class="fas fa-store mr-1 text-orange-400"></i>Nama Toko/UMKM *
          </label>
          <input type="text" id="namaMitra" name="namaMitra" placeholder="Nama toko Anda" 
            class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
        </div>
        <div class="input-group">
          <label class="block text-xs font-medium mb-2 text-left text-gray-400">
            <i class="fas fa-tags mr-1 text-pink-400"></i>Kategori *
          </label>
          <select id="kategori" name="kategori" 
            class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20">
            <option value="">Pilih kategori...</option>
            <option value="makanan">🍔 Makanan</option>
            <option value="minuman">🥤 Minuman</option>
            <option value="jasa">🔧 Jasa</option>
            <option value="lainnya">📦 Lainnya</option>
          </select>
        </div>
        <div class="input-group">
          <label class="block text-xs font-medium mb-2 text-left text-gray-400">
            <i class="fas fa-map-marker-alt mr-1 text-red-400"></i>Alamat *
          </label>
          <textarea id="alamat" name="alamat" placeholder="Alamat toko" rows="2"
            class="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 resize-none"></textarea>
        </div>
      </div>`;
  },

  registerSection() {
    return `
      <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Animated Background -->
        <div class="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 opacity-50"></div>
        <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        
        <!-- Main Card - COMPACT -->
        <div class="relative w-full max-w-sm">
          <div class="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-5 animate-scale-in">
            <!-- Header -->
            <div class="text-center mb-4">
              <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <i class="fas fa-user-plus text-xl text-white"></i>
              </div>
              <h2 class="text-lg font-bold text-white">Daftar Sekarang</h2>
              <p class="text-gray-400 text-xs mt-1">Lengkapi data diri Anda</p>
            </div>

            <!-- User Info Card -->
            <div class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl mb-4">
              <img id="register-avatar" src="" alt="Avatar" class="w-10 h-10 rounded-full object-cover">
              <div class="text-left min-w-0">
                <div id="register-name" class="font-semibold text-white text-sm truncate"></div>
                <div id="register-email" class="text-gray-400 text-xs truncate"></div>
              </div>
            </div>

            <!-- Form -->
            <form id="register-form" class="space-y-3">
              ${this.roleField()}
              ${this.whatsappField()}
              <div id="nis-field" class="hidden">${this.nisField()}</div>
              <div id="kode-guru-field" class="hidden">${this.kodeGuruField()}</div>
              <div id="nama-field" class="hidden">${this.namaField()}</div>
              <div id="kelas-field" class="hidden">${this.kelasField()}</div>
              <div id="kelas-field-guru" class="hidden">${this.kelasFieldGuru()}</div>
              <div id="sekolah-field-siswa" class="hidden">${this.sekolahSiswaField()}</div>
              <div id="sekolah-field-guru" class="hidden">${this.sekolahGuruField()}</div>
              <div id="sekolah-field" class="hidden">${this.sekolahGuruField()}</div>
              <div id="mitra-fields" class="hidden">${this.mitraFields()}</div>
              
              <div id="register-error" class="hidden p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center"></div>
              
              <button type="submit" class="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm">
                <i class="fas fa-rocket mr-2"></i>Daftar Sekarang
              </button>
              
              <button type="button" id="cancel-register" class="w-full py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-colors text-sm">
                <i class="fas fa-arrow-left mr-2"></i>Batal
              </button>
            </form>
          </div>
        </div>
      </div>`;
  }
};


