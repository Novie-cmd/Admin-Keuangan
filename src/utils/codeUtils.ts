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
