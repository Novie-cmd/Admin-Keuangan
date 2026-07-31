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
