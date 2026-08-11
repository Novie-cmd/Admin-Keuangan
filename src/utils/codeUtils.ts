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

  let isNegative = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    isNegative = true;
    s = s.substring(1, s.length - 1).trim();
  } else if (s.startsWith('-')) {
    isNegative = true;
    s = s.substring(1).trim();
  }

  s = s.replace(/^(rp|idr)\.?\s*/i, '').trim();

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
  // Check if sheet2D has positional data
  let isPositionalFormat = false;
  if (sheet2D && sheet2D.length >= 6) {
    // Check rows starting from index 5 (Row 6) to 30
    for (let i = 5; i < Math.min(sheet2D.length, 30); i++) {
      const row = sheet2D[i];
      if (!row) continue;
      const valQ = row[16]; // Col Q (Kode Sub)
      const valS = row[18]; // Col S (Kode Belanja)
      const valAA = row[26]; // Col AA (Nilai Realisasi)
      const valAP = row[41]; // Col AP (No SP2D)
      const valAQ = row[42]; // Col AQ (Tgl SP2D)
      const valM = row[12]; // Col M (Fallback Kode Sub)
      const valT = row[19]; // Col T (Fallback Nilai)

      if (valQ || valS || valAA || valAP || valAQ || valM || valT) {
        const codeSub = extractCode(valQ) || extractCode(valM);
        const codeBel = extractCode(valS);
        const numAA = parseNumber(valAA);
        const numT = parseNumber(valT);
        if (codeSub || codeBel || numAA > 0 || numT > 0 || String(valAP).toLowerCase().includes('sp2d')) {
          isPositionalFormat = true;
          break;
        }
      }
    }
  }

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

  if (isPositionalFormat && sheet2D) {
    // Parse using exact Q6, R6, S6, T6, AA6, AP6, AQ6, AO6, Z6, AD6, AE6 layout (with fallbacks for M6/AN6)
    // Row 6 is index 5
    for (let idx = 5; idx < sheet2D.length; idx++) {
      const row = sheet2D[idx];
      if (!row || row.length === 0) continue;

      // Q6 (idx 16) - Kode Sub Kegiatan
      const subRaw = row[16] || row[12];
      // R6 (idx 17) - Nama Sub Kegiatan
      const namaSub = String(row[17] || row[14] || '').trim();
      // S6 (idx 18) - Kode Rekening Belanja
      const belRaw = row[18] || row[16];
      // T6 (idx 19) - Nama Rekening Belanja
      const namaBelanja = String(row[19] || row[18] || '').trim();
      // Z6 (idx 25) - Uraian Transaksi / Pekerjaan
      const uraianVal = String(row[25] || '').trim();
      // AA6 (idx 26) - Nilai Realisasi (Rp)
      const nilaiVal = parseNumber(row[26] !== undefined && row[26] !== '' ? row[26] : row[19]);
      // AD6 (idx 29) - Nama Rekanan / Penyedia
      const rekananVal = String(row[29] || '').trim();
      // AE6 (idx 30) - Keterangan Rekanan / Bank / NPWP
      const ketVal = String(row[30] || '').trim();
      // AO6 (idx 40) - Nomor SPM
      const spmVal = String(row[40] || (row[26] && isNaN(Number(row[26])) ? row[26] : '') || '').trim();
      // AP6 (idx 41) - Nomor SP2D
      const sp2dVal = String(row[41] || '').trim();
      // AQ6 (idx 42) - Tanggal SP2D
      const tglRaw = row[42] || row[39];

      // Skip row if it's completely empty or header text
      if (!subRaw && !belRaw && nilaiVal === 0 && !sp2dVal) continue;
      if (String(subRaw).toLowerCase().includes('sub kegiatan') && String(belRaw).toLowerCase().includes('rekening')) continue;

      const { prog, keg, sub } = deriveCodesFromSub(subRaw);
      const bel = extractCode(belRaw) || '5.1.02.01.01.0024';
      const parsedDate = parseExcelDate(tglRaw, selectedTahun);
      const yearToUse = parsedDate.year || selectedTahun;

      results.push({
        rowNum: idx + 1,
        tahun: yearToUse,
        kodeProgram: prog,
        kodeKegiatan: keg,
        kodeSub: sub,
        namaSub: namaSub || `Sub Kegiatan ${sub}`,
        kodeBelanja: bel,
        namaBelanja: namaBelanja || `Belanja ${bel}`,
        noSP2D: sp2dVal || `SP2D-${yearToUse}-${idx - 4}`,
        noSPM: spmVal || (sp2dVal ? sp2dVal.replace('SP2D', 'SPM') : `SPM-${yearToUse}-${idx - 4}`),
        nilai: nilaiVal,
        uraian: uraianVal || 'Realisasi Keuangan',
        rekanan: rekananVal || 'PT Bank NTB Syariah',
        keterangan: ketVal,
        tanggal: parsedDate.isoDate
      });
    }
  }

  // If positional format yielded nothing or wasn't detected, fallback to JSON header key matching
  if (results.length === 0 && sheetJson) {
    sheetJson.forEach((row, idx) => {
      const thnStr = findRowValueByKeys(row, ['tahun', 'thn', 'tahunanggaran', 'ta']);
      const thn = parseInt(thnStr || String(selectedTahun), 10) || selectedTahun;

      const progRaw = findRowValueByKeys(row, ['kodeprogram', 'kodeprog', 'program'], true);
      const kegRaw = findRowValueByKeys(row, ['kodekegiatan', 'kodekeg', 'kegiatan'], true);
      const subRaw = findRowValueByKeys(row, ['kodesubkegiatan', 'kodesub', 'subkegiatan', 'sub'], true);
      const belRaw = findRowValueByKeys(row, ['kodebelanja', 'koderekening', 'rekening', 'kode', 'belanja'], true);

      const { prog, keg, sub } = deriveCodesFromSub(subRaw || kegRaw || progRaw);
      const finalProg = extractCode(progRaw) || prog;
      const finalKeg = extractCode(kegRaw) || keg;
      const finalSub = extractCode(subRaw) || sub;
      const bel = extractCode(belRaw) || '5.1.02.01.01.0024';

      const namaSub = findRowValueByKeys(row, ['namasubkegiatan', 'namasub', 'subkegiatan']);
      const namaBel = findRowValueByKeys(row, ['namabelanja', 'uraianbelanja', 'namarekening', 'rekening']);
      const sp2dVal = findRowValueByKeys(row, ['nosp2d', 'sp2d', 'nomorsp2d', 'nomorsp2dls']);
      const spmVal = findRowValueByKeys(row, ['nospm', 'spm', 'nomorspm']);
      const nilaiRaw = findRowValueByKeys(row, ['nilairealisasi', 'nilai', 'realisasi', 'jumlah', 'nilaisp2d']);
      const nilaiVal = parseNumber(nilaiRaw);
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
        namaSub: namaSub || `Sub Kegiatan ${finalSub}`,
        kodeBelanja: bel,
        namaBelanja: namaBel || `Belanja ${bel}`,
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

