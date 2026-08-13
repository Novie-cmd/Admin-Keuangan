export const extractCode = (val: any): string => {
  if (val === undefined || val === null) return '';
  const str = String(val).trim();
  if (!str) return '';
  // Regex to extract budget codes like 5.1.02.01.01.0024 or 5.01.01.2.01.01 or 5.01.01
  const match = str.match(/\b\d+(\.\d+)+\b/);
  if (match) {
    return match[0];
  }
  return str;
};

export const normalizeCode = (val: any): string => {
  return extractCode(val).trim().toLowerCase();
};

export const isCodeEqual = (a: any, b: any): boolean => {
  if (!a || !b) return false;
  return normalizeCode(a) === normalizeCode(b);
};

export const findRowValueByKeys = (
  row: Record<string, any>,
  targetKeys: string[],
  isCodeField: boolean = false
): string => {
  if (!row) return '';
  const rowKeys = Object.keys(row);

  const isDescriptionHeader = (header: string): boolean => {
    const h = header.toLowerCase();
    return (
      h.includes('nama') ||
      h.includes('uraian') ||
      h.includes('rincian') ||
      h.includes('deskripsi') ||
      h.includes('keterangan')
    );
  };

  // 1. First Pass: Exact match
  for (const targetKey of targetKeys) {
    const cleanTarget = targetKey.toLowerCase().replace(/[\s_\-()/.:]/g, '');
    for (const rKey of rowKeys) {
      if (!rKey) continue;
      const cleanR = rKey.trim().toLowerCase().replace(/[\s_\-()/.:]/g, '');
      if (cleanR === cleanTarget) {
        if (isCodeField && isDescriptionHeader(rKey)) continue;
        const val = row[rKey];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }

  // 2. Second Pass: Substring match (includes)
  for (const targetKey of targetKeys) {
    const cleanTarget = targetKey.toLowerCase().replace(/[\s_\-()/.:]/g, '');
    for (const rKey of rowKeys) {
      if (!rKey) continue;
      const cleanR = rKey.trim().toLowerCase().replace(/[\s_\-()/.:]/g, '');
      if (cleanR.includes(cleanTarget)) {
        if (isCodeField && isDescriptionHeader(rKey)) continue;
        const val = row[rKey];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }

  return '';
};

export const parseNumber = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (val === undefined || val === null) return 0;
  let s = String(val).trim();
  if (!s) return 0;

  // 1. Strip currency prefix first (Rp, Rp., IDR, IDR.)
  s = s.replace(/^(rp|idr)\.?\s*/i, '').trim();
  if (!s) return 0;

  // 2. Ignore document numbers, dates, or non-numeric text containing letters, slashes, or colons
  if (/[a-z]/i.test(s) || s.includes('/') || s.includes(':')) {
    return 0;
  }

  let isNegative = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    isNegative = true;
    s = s.substring(1, s.length - 1).trim();
  } else if (s.startsWith('-')) {
    isNegative = true;
    s = s.substring(1).trim();
  }

  s = s.replace(/\s+/g, '');
  if (!s) return 0;

  // Ignore dates like 2026-02-10
  if (s.includes('-')) return 0;

  // Ignore budget codes like 5.01.01 or 5.01.01.2.01.01 or 5.1.02.01.01.0024
  if (/^\d+(\.\d+){2,}$/.test(s)) {
    const dotParts = s.split('.');
    const isCurrencyThousand = dotParts.slice(1).every(p => p.length === 3);
    if (!isCurrencyThousand) {
      return 0;
    }
  }

  if (s.includes('.') && s.includes(',')) {
    if (s.lastIndexOf('.') < s.lastIndexOf(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes('.')) {
    const parts = s.split('.');
    if (parts.length > 2) {
      s = s.replace(/\./g, '');
    } else if (parts.length === 2 && parts[1].length === 3) {
      s = s.replace(/\./g, '');
    }
  } else if (s.includes(',')) {
    const parts = s.split(',');
    if (parts.length > 2) {
      s = s.replace(/,/g, '');
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        s = s.replace(/,/g, '');
      } else {
        s = s.replace(',', '.');
      }
    }
  }

  const num = parseFloat(s);
  if (isNaN(num)) return 0;
  return isNegative ? -num : num;
};

export const isValidKodeSub = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  const str = String(val).trim().toLowerCase();
  if (!str) return false;
  if (
    str.includes('sub kegiatan') ||
    str.includes('kode sub') ||
    str.includes('uraian') ||
    str.includes('rekening') ||
    str.includes('jumlah') ||
    str.includes('total') ||
    str.includes('sisa')
  ) {
    return false;
  }
  const code = extractCode(val);
  if (!code) return false;
  // Must match budget sub-activity pattern (e.g. 5.01.01.2.01.01 or 5.01.01.2.01 or 5.01.01)
  return /^\d+(\.\d+){2,}$/.test(code);
};

export const parseExcelDate = (val: any, fallbackYear: number): { isoDate: string; month: number; year: number } => {
  const now = new Date();
  if (!val) {
    return {
      isoDate: `${fallbackYear}-01-01`,
      month: 1,
      year: fallbackYear,
    };
  }

  if (val instanceof Date && !isNaN(val.getTime())) {
    return {
      isoDate: val.toISOString().split('T')[0],
      month: val.getMonth() + 1,
      year: val.getFullYear() || fallbackYear,
    };
  }

  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (!isNaN(num) && num > 20000 && num < 70000) {
    const jsDate = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      const y = jsDate.getUTCFullYear() || fallbackYear;
      const m = jsDate.getUTCMonth() + 1;
      const d = jsDate.getUTCDate();
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return { isoDate: iso, month: m, year: y };
    }
  }

  const str = String(val).trim();
  if (!str) {
    return {
      isoDate: `${fallbackYear}-01-01`,
      month: 1,
      year: fallbackYear,
    };
  }

  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10) || fallbackYear;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { isoDate: iso, month, year };
    }
  }

  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10) || fallbackYear;
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { isoDate: iso, month, year };
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return {
      isoDate: d.toISOString().split('T')[0],
      month: d.getMonth() + 1,
      year: d.getFullYear() || fallbackYear,
    };
  }

  return {
    isoDate: `${fallbackYear}-01-01`,
    month: 1,
    year: fallbackYear,
  };
};

export const makeRealisasiCompositeKey = (
  sp2d: string,
  kodeBelanja: string,
  kodeSub: string,
  nilai: number,
  uraian: string
): string => {
  const cleanSp2d = (sp2d || '').trim().toLowerCase();
  const cleanBel = extractCode(kodeBelanja).toLowerCase();
  const cleanSub = extractCode(kodeSub).toLowerCase();
  const cleanUraian = (uraian || '').trim().toLowerCase();
  return `${cleanSp2d}|${cleanBel}|${cleanSub}|${nilai}|${cleanUraian}`;
};

export const deriveCodesFromSub = (subCodeRaw: string) => {
  const clean = extractCode(subCodeRaw) || '5.01.01.2.01.01';
  const parts = clean.split('.');

  let prog = '5.01.01';
  let keg = '5.01.01.2.01';
  let sub = clean;

  if (parts.length >= 6) {
    prog = parts.slice(0, 3).join('.');
    keg = parts.slice(0, 5).join('.');
    sub = parts.slice(0, 6).join('.');
  } else if (parts.length >= 5) {
    prog = parts.slice(0, 3).join('.');
    keg = parts.slice(0, 5).join('.');
    sub = keg + '.01';
  } else if (parts.length >= 3) {
    prog = parts.slice(0, 3).join('.');
    keg = prog + '.2.01';
    sub = keg + '.01';
  }

  return { prog, keg, sub };
};

export const parseRealisasiFromExcelData = (
  sheet2D: any[][],
  sheetJson: any[],
  selectedTahun: number
) => {
  const results: {
    rowNum: number;
    tahun: number;
    kodeProgram: string;
    kodeKegiatan: string;
    kodeSub: string;
    namaSub: string;
    kodeBelanja: string;
    namaBelanja: string;
    noSP2D: string;
    noSPM: string;
    nilai: number;
    uraian: string;
    rekanan: string;
    keterangan: string;
    tanggal: string;
  }[] = [];

  // Sticky Context Variables for hierarchical/grouped Excel sheets
  let activeSubCode = '5.01.01.2.01.01';
  let activeSubName = 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah';
  let activeBelCode = '5.1.02.01.01.0024';
  let activeBelName = 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor';

  if (sheet2D && sheet2D.length > 0) {
    for (let idx = 0; idx < sheet2D.length; idx++) {
      const row = sheet2D[idx];
      if (!row || row.length === 0) continue;

      // Check if this row is a summary / total / heading header row
      const rowTextLower = row.map(cell => String(cell || '').toLowerCase()).join(' ');
      const isSummaryRow =
        rowTextLower.includes('jumlah realisasi') ||
        rowTextLower.includes('sub total') ||
        rowTextLower.includes('subtotal') ||
        rowTextLower.includes('grand total') ||
        rowTextLower.includes('total sp2d') ||
        rowTextLower.includes('sisa pagu');

      // Check if row has explicit SP2D number
      let rowSp2d = '';
      if (row[41] && String(row[41]).trim()) {
        rowSp2d = String(row[41]).trim();
      } else {
        // Search across row cells for SP2D pattern
        for (let c = 0; c < row.length; c++) {
          const strCell = String(row[c] || '').trim();
          if (strCell && (strCell.toLowerCase().includes('sp2d') || strCell.includes('/SP2D/') || strCell.includes('/sp2d/'))) {
            rowSp2d = strCell;
            break;
          }
        }
      }

      // If it is a summary row without an explicit SP2D number, skip it to prevent double counting
      if (isSummaryRow && !rowSp2d) {
        continue;
      }

      // 1. Detect / update Kode Sub Kegiatan
      let rowSubCode = '';
      let rowSubName = '';

      // Check standard positions first: Q6 (16), M6 (12)
      if (isValidKodeSub(row[16])) {
        rowSubCode = extractCode(row[16]);
        rowSubName = String(row[17] || '').trim();
      } else if (isValidKodeSub(row[12])) {
        rowSubCode = extractCode(row[12]);
        rowSubName = String(row[13] || '').trim();
      } else {
        // Search across all columns
        for (let c = 0; c < row.length; c++) {
          if (isValidKodeSub(row[c])) {
            rowSubCode = extractCode(row[c]);
            rowSubName = String(row[c + 1] || '').trim();
            break;
          }
        }
      }

      if (rowSubCode) {
        activeSubCode = rowSubCode;
        if (rowSubName) activeSubName = rowSubName;
      }

      // 2. Detect / update Kode Belanja
      let rowBelCode = '';
      let rowBelName = '';

      if (row[18] && extractCode(row[18]) && /^\d+(\.\d+){4,}$/.test(extractCode(row[18]))) {
        rowBelCode = extractCode(row[18]);
        rowBelName = String(row[19] || '').trim();
      } else {
        for (let c = 0; c < row.length; c++) {
          const cand = extractCode(row[c]);
          if (cand && /^\d+(\.\d+){4,}$/.test(cand)) {
            rowBelCode = cand;
            rowBelName = String(row[c + 1] || row[19] || '').trim();
            break;
          }
        }
      }

      if (rowBelCode) {
        activeBelCode = rowBelCode;
        if (rowBelName) activeBelName = rowBelName;
      }

      // 3. Extract Nilai Realisasi (Rp)
      let nilaiVal = parseNumber(row[26]); // Primary: Col AA (26)
      if (nilaiVal === 0) {
        nilaiVal = parseNumber(row[19]); // Col T (19)
      }
      if (nilaiVal === 0) {
        // Search adjacent & common value columns
        for (const cIdx of [18, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15]) {
          if (cIdx < row.length) {
            const cand = parseNumber(row[cIdx]);
            if (cand > 0 && cand !== selectedTahun && cand !== 2024 && cand !== 2025 && cand !== 2026 && cand !== 2027) {
              nilaiVal = cand;
              break;
            }
          }
        }
      }
      if (nilaiVal === 0) {
        // Fallback: scan any positive currency number in row
        for (let c = 0; c < row.length; c++) {
          const cand = parseNumber(row[c]);
          if (cand > 0 && cand !== selectedTahun && cand !== 2024 && cand !== 2025 && cand !== 2026 && cand !== 2027) {
            if (cand < 31 && c <= 2) continue;
            nilaiVal = cand;
            break;
          }
        }
      }

      // Skip row if no valid positive realisasi value
      if (nilaiVal <= 0) continue;

      // 4. Extract Metadata
      const namaSub = rowSubName || activeSubName || `Sub Kegiatan ${activeSubCode}`;
      const namaBel = rowBelName || activeBelName || `Belanja ${activeBelCode}`;

      const uraianVal = String(row[25] || row[24] || '').trim();
      const rekananVal = String(row[29] || '').trim();
      const ketVal = String(row[30] || '').trim();

      let spmVal = String(row[40] || '').trim();
      if (!spmVal) {
        for (let c = 0; c < row.length; c++) {
          const strCell = String(row[c] || '').trim();
          if (strCell && (strCell.toLowerCase().includes('spm') || strCell.includes('/SPM/') || strCell.includes('/spm/'))) {
            spmVal = strCell;
            break;
          }
        }
      }

      const tglRaw = row[42] || row[39];
      const { prog, keg, sub } = deriveCodesFromSub(rowSubCode || activeSubCode);
      const bel = rowBelCode || activeBelCode || '5.1.02.01.01.0024';
      const parsedDate = parseExcelDate(tglRaw, selectedTahun);
      const yearToUse = parsedDate.year || selectedTahun;

      results.push({
        rowNum: idx + 1,
        tahun: yearToUse,
        kodeProgram: prog,
        kodeKegiatan: keg,
        kodeSub: sub,
        namaSub: namaSub,
        kodeBelanja: bel,
        namaBelanja: namaBel,
        noSP2D: rowSp2d || `SP2D-${yearToUse}-${idx + 1}`,
        noSPM: spmVal || (rowSp2d ? rowSp2d.replace('SP2D', 'SPM') : `SPM-${yearToUse}-${idx + 1}`),
        nilai: nilaiVal,
        uraian: uraianVal || 'Realisasi Keuangan',
        rekanan: rekananVal || 'PT Bank NTB Syariah',
        keterangan: ketVal,
        tanggal: parsedDate.isoDate
      });
    }
  }

  // Fallback to sheetJson if sheet2D is empty or yielded no rows
  if (results.length === 0 && sheetJson) {
    sheetJson.forEach((row, idx) => {
      const thnStr = findRowValueByKeys(row, ['tahun', 'thn', 'tahunanggaran', 'ta']);
      const thn = parseInt(thnStr || String(selectedTahun), 10) || selectedTahun;

      const progRaw = findRowValueByKeys(row, ['kodeprogram', 'kodeprog', 'program'], true);
      const kegRaw = findRowValueByKeys(row, ['kodekegiatan', 'kodekeg', 'kegiatan'], true);
      const subRaw = findRowValueByKeys(row, ['kodesubkegiatan', 'kodesub', 'subkegiatan', 'sub'], true);
      const belRaw = findRowValueByKeys(row, ['kodebelanja', 'koderekening', 'rekening', 'kode', 'belanja'], true);

      const { prog, keg, sub } = deriveCodesFromSub(subRaw || kegRaw || progRaw || activeSubCode);
      const finalProg = extractCode(progRaw) || prog;
      const finalKeg = extractCode(kegRaw) || keg;
      const finalSub = extractCode(subRaw) || sub || activeSubCode;
      const bel = extractCode(belRaw) || activeBelCode || '5.1.02.01.01.0024';

      const namaSub = findRowValueByKeys(row, ['namasubkegiatan', 'namasub', 'subkegiatan']) || activeSubName;
      const namaBel = findRowValueByKeys(row, ['namabelanja', 'uraianbelanja', 'namarekening', 'rekening']) || activeBelName;
      const sp2dVal = findRowValueByKeys(row, ['nosp2d', 'sp2d', 'nomorsp2d', 'nomorsp2dls']);
      const spmVal = findRowValueByKeys(row, ['nospm', 'spm', 'nomorspm']);
      const nilaiRaw = findRowValueByKeys(row, ['nilairealisasi', 'nilai', 'realisasi', 'jumlah', 'nilaisp2d']);
      const nilaiVal = parseNumber(nilaiRaw);

      if (nilaiVal <= 0) return;

      const uraianVal = findRowValueByKeys(row, ['uraian', 'keterangan', 'uraianrealisasi', 'rincian']);
      const rekananVal = findRowValueByKeys(row, ['penyedia', 'rekanan', 'penerima', 'namarekanan']);
      const ketVal = findRowValueByKeys(row, ['keterangan', 'ket', 'catatan']);
      const tglRaw = findRowValueByKeys(row, ['tanggal', 'tgl', 'tanggalsp2d']);
      const parsedDate = parseExcelDate(tglRaw, thn);

      results.push({
        rowNum: idx + 1,
        tahun: thn,
        kodeProgram: finalProg,
        kodeKegiatan: finalKeg,
        kodeSub: finalSub,
        namaSub,
        kodeBelanja: bel,
        namaBelanja: namaBel,
        noSP2D: sp2dVal || `SP2D-${thn}-${idx + 1}`,
        noSPM: spmVal || (sp2dVal ? sp2dVal.replace('SP2D', 'SPM') : `SPM-${thn}-${idx + 1}`),
        nilai: nilaiVal,
        uraian: uraianVal || 'Realisasi Keuangan',
        rekanan: rekananVal || 'PT Bank NTB Syariah',
        keterangan: ketVal,
        tanggal: parsedDate.isoDate
      });
    });
  }

  return results;
};

