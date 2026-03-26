/**
 * PDF Service - Single responsibility for template generation
 */
const Toast = window.Toast;

const MAPEL_DATA = [
  ['MAT', 'MATEMATIKA'],
  ['BIG', 'BAHASA INGGRIS'],
  ['PJOK', 'PENDIDIKAN JASMANI OLAHRAGA KEBUGARAN'],
  ['PKN', 'PENDIDIKAN KEWARGANEGARAAN'],
  ['BK', 'BIMBINGAN KONSELING'],
  ['EKO', 'EKONOMI'],
  ['BIN', 'BAHASA INDONESIA'],
  ['SENI', 'SENI'],
  ['KIM', 'KIMIA'],
  ['PAI', 'PENDIDIKAN AGAMA ISLAM'],
  ['BIO', 'BIOLOGI'],
  ['SEJ', 'SEJARAH'],
  ['ANTRO', 'ANTROPOLOGI'],
  ['GEO', 'GEOGRAFI'],
  ['PAKr', 'PENDIDIKAN AGAMA KRISTEN'],
  ['SOS', 'SOSIOLOGI'],
  ['TIK', 'INFORMATIKA'],
  ['MAND', 'MANDARIN'],
  ['BHR', 'BAHARI'],
  ['PAH', 'PENDIDIKAN AGAMA HINDU'],
  ['PAK', 'PENDIDIKAN AGAMA KATHOLIK'],
  ['BJW', 'BAHASA JAWA'],
  ['FIS', 'FISIKA'],
  ['PKWU', 'PENDIDIKAN KEWIRAUSAHAAN']
];

const TEMPLATE_CONFIG = {
  siswa: {
    filename: 'siswa_template',
    successTitle: 'PDF Template Downloaded',
    successMessage: schoolId => `siswa_template_${schoolId}.pdf ready`,
    build(doc, schoolId) {
      doc.setFontSize(16);
      doc.text('SPINX SISWA IMPORT TEMPLATE', 105, 25, { align: 'center' });
      doc.setFontSize(11);
      doc.text('TSV Format (Tab Separated)', 20, 42);
      doc.text('Example:', 20, 52);

      doc.autoTable({
        startY: 60,
        head: [['nis', 'nama', 'jenis_kelamin', 'kelas', 'tahun_ajaran', 'asal_sekolah']],
        body: [['13005', 'AGHA MUGIONO', 'L', 'x-1', '2025/2026', schoolId]],
        styles: { fontSize: 8, cellPadding: 3, halign: 'left', valign: 'middle' },
        headStyles: { fillColor: [54, 162, 235], fontSize: 9, fontStyle: 'bold' },
        columnStyles: { 1: { cellWidth: 50 } },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto'
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.text('Notes:', 20, finalY);
      doc.setFontSize(8);
      doc.text('• Use this exact table format in TSV', 25, finalY + 8);
      doc.text('• asal_sekolah auto-filled', 25, finalY + 16);
    },
    fallback(schoolId) {
      return {
        headers: ['nis', 'nama', 'jenis_kelamin', 'kelas', 'tahun_ajaran', 'asal_sekolah'],
        example: ['13925', 'AGHASA ZEYNA PUTRI MUGIONO', 'P', 'x-1', '2025/2026', schoolId]
      };
    }
  },
  guru: {
    filename: 'guru_template',
    successTitle: 'Template Guru Downloaded',
    successMessage: () => `${MAPEL_DATA.length} mapel + format guru ready`,
    build(doc, schoolId) {
      let startY = 35;

      doc.setFontSize(18);
      doc.text('SPINX GURU IMPORT TEMPLATE', 105, startY, { align: 'center' });
      startY += 15;

      doc.setFontSize(12);
      doc.text('1. DAFTAR MAPEL (Reference)', 20, startY);
      startY += 8;

      doc.autoTable({
        startY,
        head: [['kode_mapel', 'nama_mapel']],
        body: MAPEL_DATA,
        styles: { fontSize: 7, cellPadding: 2, halign: 'left' },
        headStyles: { fillColor: [75, 192, 192], fontSize: 8, fontStyle: 'bold' },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
        columnStyles: { 0: { cellWidth: 25 } }
      });

      startY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text('Gunakan kode_mapel dari tabel atas pada kolom kode_mapel', 20, startY);
      startY += 12;

      doc.setFontSize(12);
      doc.text('2. FORMAT GURU (TSV - Tab Separated)', 20, startY);
      startY += 8;

      doc.autoTable({
        startY,
        head: [['kode_guru', 'nama', 'kode_mapel', 'asal_sekolah']],
        body: [['K1', 'RR Amadani, S.Pd', 'FIS', schoolId]],
        styles: { fontSize: 8, cellPadding: 3, halign: 'left', valign: 'middle' },
        headStyles: { fillColor: [54, 162, 235], fontSize: 9, fontStyle: 'bold' },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto'
      });
    },
    fallback(schoolId) {
      return {
        mapel: MAPEL_DATA.map(([kode_mapel, nama_mapel]) => ({ kode_mapel, nama_mapel })),
        headers: ['kode_guru', 'nama', 'kode_mapel', 'asal_sekolah'],
        example: ['K1', 'ROSYIDAH ROHMAH, S.Pd', 'FIS', schoolId]
      };
    }
  },
  mitra: {
    filename: 'mitra_template',
    successTitle: 'Template Mitra Downloaded',
    successMessage: () => 'Full mitra format ready',
    build(doc, schoolId) {
      let startY = 35;

      doc.setFontSize(18);
      doc.text('SPINX MITRA IMPORT TEMPLATE', 105, startY, { align: 'center' });
      startY += 15;

      doc.setFontSize(12);
      doc.text('FORMAT MITRA (TSV - Tab Separated)', 20, startY);
      startY += 8;

      doc.autoTable({
        startY,
        head: [['mitra_id', 'nama_mitra', 'owner_name', 'email', 'no_wa', 'alamat', 'kategori', 'asal_sekolah']],
        body: [['m-001', 'warung bu bos', 'bu bosi', 'example@gmail.com', '08123456789', 'jl manalagi', 'FNB', schoolId]],
        styles: { fontSize: 8, cellPadding: 3, halign: 'left', valign: 'middle' },
        headStyles: { fillColor: [75, 192, 192], fontSize: 9, fontStyle: 'bold' },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
        columnStyles: { 1: { cellWidth: 35 }, 4: { cellWidth: 35 } }
      });

      startY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text('Kategori Contoh: FNB, Snack, Minuman, Toko Buku, Fotokopi', 20, startY);
    },
    fallback(schoolId) {
      return {
        headers: ['mitra_id', 'nama_mitra', 'owner_name', 'email', 'no_wa', 'alamat', 'kategori', 'asal_sekolah'],
        example: ['m-001', 'warung bu bos', 'bu bosi', 'example@gmail.com', '08123456789', 'jl manalagi', 'FNB', schoolId]
      };
    }
  }
};

function downloadJsonFallback(role, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${role}_template_fallback.json`;
  link.click();

  URL.revokeObjectURL(url);
}

function getTemplateConfig(role) {
  return TEMPLATE_CONFIG[role] || TEMPLATE_CONFIG.siswa;
}

export class PDFService {
  static async checkPDFReady(maxAttempts = 50) {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const check = () => {
        attempts += 1;
        const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
        const hasAutoTable =
          jsPDF &&
          typeof jsPDF === 'function' &&
          jsPDF.API &&
          typeof jsPDF.API.autoTable === 'function';

        if (hasAutoTable) resolve(true);
        else if (attempts >= maxAttempts) reject(new Error('PDF plugins failed'));
        else setTimeout(check, 200);
      };

      check();
    });
  }

  static async generateTemplate(schoolId, role) {
    const config = getTemplateConfig(role);
    const { jsPDF } = window.jspdf || window;

    if (!jsPDF) {
      throw new Error('jsPDF not found');
    }

    try {
      const doc = new jsPDF();
      config.build(doc, schoolId);
      const filename = `${config.filename}_${new Date().toISOString().slice(0, 10)}.pdf`;

      doc.save(filename);
      Toast?.success?.(config.successTitle, config.successMessage(schoolId));

      return { success: true, filename };
    } catch (error) {
      console.error('PDF generation failed:', error);
      Toast?.error?.('PDF Error', 'Plugin failed to load. Try refresh (F5)');
      downloadJsonFallback(role, config.fallback(schoolId));
      return { success: false, fallback: true };
    }
  }
}
