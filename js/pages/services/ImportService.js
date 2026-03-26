/**
 * Import Service - Single responsibility for XLS import
 * Clean, DRY, modular
 */
export class ImportService {
  constructor(authApi, schoolId) {
    this.authApi = authApi;
    this.schoolId = schoolId;
  }

  async parseFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'xlsx' || ext === 'xls') {
      return this.parseExcel(file);
    }
    return this.parseText(file);
  }

  async parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellText: true, cellDates: false });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1, raw: false, defval: '', blankrows: false
          });
          resolve(this.rowsToObjects(rows));
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async parseText(file) {
    const text = await file.text();
    const rows = text.split(/\r?\n/)
      .map(row => row.split(/\t|,/))
      .filter(row => row.some(cell => this.normalizeImportValue(cell) !== ''));
    return this.rowsToObjects(rows);
  }

  rowsToObjects(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return [];
    const [rawHeaders = [], ...bodyRows] = rows;
    const headers = rawHeaders.map((header, index) => {
      const normalized = this.normalizeImportHeader(header);
      return normalized || `column_${index + 1}`;
    });
    return bodyRows.map(row => headers.reduce((obj, header, index) => {
      obj[header] = this.normalizeImportValue(row?.[index]);
      return obj;
    }, {})).filter(row => !this.isImportRowEmpty(row));
  }

  normalizeImportHeader(header) {
    return (header ?? '').toString().replace(/^\uFEFF/, '').trim().toLowerCase()
      .replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '');
  }

  normalizeImportValue(value) {
    return value == null ? '' : value.toString().trim();
  }

  isImportRowEmpty(row) {
    return Object.values(row).every(value => this.normalizeImportValue(value) === '');
  }

  normalizeData(rows, role) {
    return rows.map(r => {
      if (role === 'guru') {
        return { kode_guru: r.kode_guru || r.KODE_GURU, nama: r.nama, kode_mapel: r.kode_mapel, asal_sekolah: this.schoolId };
      }
      if (role === 'mitra') {
        return { mitra_id: r.mitra_id, nama_mitra: r.nama_mitra, owner_name: r.owner_name, email: r.email, no_wa: r.no_wa, alamat: r.alamat, kategori: r.kategori, asal_sekolah: this.schoolId };
      }
      return { nis: r.nis, nama: r.nama, jenis_kelamin: r.jenis_kelamin, kelas: r.kelas, tahun_ajaran: r.tahun_ajaran, asal_sekolah: this.schoolId };
    });
  }

  async confirmImport(file, role) {
    const rawData = await this.parseFile(file);
    if (!rawData || rawData.length === 0) throw new Error('No data');
    
    const data = this.normalizeData(rawData, role);
    const endpoint = { siswa: 'importstudentsmaster', guru: 'importgurumaster', mitra: 'importmitramaster' }[role];
    const payload = { schoolId: this.schoolId };
    payload[role === 'siswa' ? 'students' : role === 'guru' ? 'teachers' : 'mitras'] = data;
    
    const result = await this.authApi.call(endpoint, payload);
    return result;
  }
}

