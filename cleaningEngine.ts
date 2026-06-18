import { DataRow, ColumnInfo, CleaningStep, CleaningResult, Issue } from './types';
import { formatPhoneNumber, type PhoneCountryKey } from './phoneUtils';

export function analyzeColumns(data: DataRow[]): ColumnInfo[] {
  if (data.length === 0) return [];
  const columns = Object.keys(data[0]);

  return columns.map(col => {
    const values = data.map(row => row[col]);
    const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
    const uniqueVals = new Set(nonNull.map(v => String(v)));

    let type: ColumnInfo['type'] = 'string';
    const sampleNonNull = nonNull.slice(0, 50).map(v => String(v));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/;
    const numberRegex = /^-?[\d,]+\.?\d*$/;
    const dateRegex = /^\d{1,4}[-\/\.]\d{1,2}[-\/\.]\d{1,4}$/;

    if (sampleNonNull.length > 0) {
      const emailMatch = sampleNonNull.filter(v => emailRegex.test(v)).length;
      const phoneMatch = sampleNonNull.filter(v => phoneRegex.test(v) && v.length >= 7).length;
      const numberMatch = sampleNonNull.filter(v => numberRegex.test(v.replace(/,/g, ''))).length;
      const dateMatch = sampleNonNull.filter(v => dateRegex.test(v)).length;
      const threshold = sampleNonNull.length * 0.6;

      if (emailMatch > threshold) type = 'email';
      else if (phoneMatch > threshold) type = 'phone';
      else if (dateMatch > threshold) type = 'date';
      else if (numberMatch > threshold) type = 'number';
    }

    return {
      name: col,
      type,
      nullCount: values.length - nonNull.length,
      uniqueCount: uniqueVals.size,
      sampleValues: sampleNonNull.slice(0, 5),
      totalCount: values.length,
    };
  });
}

export function applyCleaningSteps(
  data: DataRow[],
  steps: CleaningStep[],
  columns: ColumnInfo[]
): CleaningResult {
  let cleanedData = data.map(row => ({ ...row }));
  const issues: Issue[] = [];
  let duplicatesRemoved = 0;
  let invalidEmailsFixed = 0;
  let missingValuesFilled = 0;
  let formattingFixed = 0;

  const enabledSteps = steps.filter(s => s.enabled);

  for (const step of enabledSteps) {
    switch (step.action) {
      case 'remove_duplicates': {
        const col = step.column || (columns.length > 0 ? columns[0].name : '');
        const seen = new Set<string>();
        const beforeCount = cleanedData.length;
        cleanedData = cleanedData.filter((row, idx) => {
          const key = col ? String(row[col] ?? '').toLowerCase().trim() : JSON.stringify(row);
          if (seen.has(key) && key !== '') {
            issues.push({
              row: idx + 1,
              column: col,
              type: 'warning',
              message: `Duplicate removed`,
              originalValue: String(row[col] ?? ''),
            });
            return false;
          }
          seen.add(key);
          return true;
        });
        duplicatesRemoved += beforeCount - cleanedData.length;
        break;
      }

      case 'fill_missing': {
        const col = step.column;
        const fillValue = step.params?.value ?? 'N/A';
        const method = step.params?.method ?? 'constant';

        if (col) {
          cleanedData.forEach((row, idx) => {
            if (row[col] === null || row[col] === undefined || row[col] === '') {
              let newVal = fillValue;
              if (method === 'mean') {
                const nums = cleanedData
                  .map(r => parseFloat(String(r[col] ?? '')))
                  .filter(n => !isNaN(n));
                newVal = nums.length > 0 ? String((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : '0';
              } else if (method === 'mode') {
                const freq: Record<string, number> = {};
                cleanedData.forEach(r => {
                  const v = String(r[col] ?? '').trim();
                  if (v) freq[v] = (freq[v] || 0) + 1;
                });
                const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
                newVal = sorted.length > 0 ? sorted[0][0] : fillValue;
              }

              issues.push({
                row: idx + 1,
                column: col,
                type: 'info',
                message: `Missing value filled with "${newVal}"`,
                originalValue: '',
                fixedValue: newVal,
              });
              row[col] = newVal;
              missingValuesFilled++;
            }
          });
        }
        break;
      }

      case 'validate_email': {
        const col = step.column;
        if (col) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const typoFixes: Record<string, string> = {
            'gmial.com': 'gmail.com',
            'gmal.com': 'gmail.com',
            'gamil.com': 'gmail.com',
            'gnail.com': 'gmail.com',
            'gmaill.com': 'gmail.com',
            'yaho.com': 'yahoo.com',
            'yahooo.com': 'yahoo.com',
            'hotmal.com': 'hotmail.com',
            'hotmial.com': 'hotmail.com',
            'outlok.com': 'outlook.com',
          };

          cleanedData.forEach((row, idx) => {
            const val = String(row[col] ?? '').trim().toLowerCase();
            if (!val) return;

            let fixed = val;
            for (const [typo, correct] of Object.entries(typoFixes)) {
              if (fixed.endsWith('@' + typo)) {
                fixed = fixed.replace('@' + typo, '@' + correct);
                break;
              }
            }

            if (fixed !== val) {
              issues.push({
                row: idx + 1,
                column: col,
                type: 'warning',
                message: `Email typo fixed`,
                originalValue: val,
                fixedValue: fixed,
              });
              row[col] = fixed;
              invalidEmailsFixed++;
            } else if (!emailRegex.test(val)) {
              issues.push({
                row: idx + 1,
                column: col,
                type: 'error',
                message: `Invalid email format`,
                originalValue: val,
              });
            }
          });
        }
        break;
      }

      case 'validate_phone': {
        const col = step.column;
        const country = (step.params?.country ?? 'auto') as PhoneCountryKey;
        const addCountryCode = Boolean(step.params?.addCountryCode);
        if (col) {
          cleanedData.forEach((row, idx) => {
            const val = String(row[col] ?? '').trim();
            if (!val) return;

            const result = formatPhoneNumber(val, country, addCountryCode);
            if (!result.valid) {
              const digitCount = val.replace(/\D/g, '').length;
              issues.push({
                row: idx + 1,
                column: col,
                type: 'error',
                message: `Invalid phone number for ${result.detectedCountry} format (${digitCount} digits)`,
                originalValue: val,
              });
            } else if (result.formatted !== val) {
              issues.push({
                row: idx + 1,
                column: col,
                type: 'info',
                message: `Phone formatted for ${result.detectedCountry}${addCountryCode ? ' with country code' : ''}`,
                originalValue: val,
                fixedValue: result.formatted,
              });
              row[col] = result.formatted;
              formattingFixed++;
            }
          });
        }
        break;
      }

      case 'text_transform': {
        const col = step.column;
        const transform = step.params?.transformation ?? 'title_case';
        if (col) {
          cleanedData.forEach((row, idx) => {
            const val = String(row[col] ?? '').trim();
            if (!val) return;

            let newVal = val;
            switch (transform) {
              case 'title_case':
                newVal = val.replace(/\w\S*/g, (txt) =>
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                break;
              case 'uppercase':
                newVal = val.toUpperCase();
                break;
              case 'lowercase':
                newVal = val.toLowerCase();
                break;
              case 'sentence_case':
                newVal = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                break;
            }

            if (newVal !== val) {
              issues.push({
                row: idx + 1,
                column: col,
                type: 'info',
                message: `Text transformed to ${transform.replace('_', ' ')}`,
                originalValue: val,
                fixedValue: newVal,
              });
              row[col] = newVal;
              formattingFixed++;
            }
          });
        }
        break;
      }

      case 'remove_whitespace': {
        const col = step.column;
        if (col) {
          cleanedData.forEach((row, idx) => {
            const val = String(row[col] ?? '');
            const trimmed = val.replace(/\s+/g, ' ').trim();
            if (trimmed !== val) {
              issues.push({
                row: idx + 1,
                column: col,
                type: 'info',
                message: `Extra whitespace removed`,
                originalValue: val,
                fixedValue: trimmed,
              });
              row[col] = trimmed;
              formattingFixed++;
            }
          });
        }
        break;
      }

      case 'remove_empty_rows': {
        const beforeCount = cleanedData.length;
        cleanedData = cleanedData.filter((row, idx) => {
          const allEmpty = Object.values(row).every(
            v => v === null || v === undefined || String(v).trim() === ''
          );
          if (allEmpty) {
            issues.push({
              row: idx + 1,
              column: 'ALL',
              type: 'warning',
              message: `Empty row removed`,
              originalValue: '',
            });
          }
          return !allEmpty;
        });
        duplicatesRemoved += beforeCount - cleanedData.length;
        break;
      }

      case 'standardize_date': {
        const col = step.column;
        if (col) {
          cleanedData.forEach((row, idx) => {
            const val = String(row[col] ?? '').trim();
            if (!val) return;

            try {
              const date = new Date(val);
              if (!isNaN(date.getTime())) {
                const formatted = date.toISOString().split('T')[0];
                if (formatted !== val) {
                  issues.push({
                    row: idx + 1,
                    column: col,
                    type: 'info',
                    message: `Date standardized to YYYY-MM-DD`,
                    originalValue: val,
                    fixedValue: formatted,
                  });
                  row[col] = formatted;
                  formattingFixed++;
                }
              }
            } catch { }
          });
        }
        break;
      }

      case 'number_format': {
        const col = step.column;
        if (col) {
          cleanedData.forEach((row, idx) => {
            const val = String(row[col] ?? '').trim();
            if (!val) return;
            const cleaned = val.replace(/[,$\s]/g, '');
            const num = parseFloat(cleaned);
            if (!isNaN(num) && cleaned !== val) {
              issues.push({
                row: idx + 1,
                column: col,
                type: 'info',
                message: `Number cleaned`,
                originalValue: val,
                fixedValue: String(num),
              });
              row[col] = num;
              formattingFixed++;
            }
          });
        }
        break;
      }

      case 'remove_special_chars': {
        const col = step.column;
        if (col) {
          cleanedData.forEach((row, idx) => {
            const val = String(row[col] ?? '');
            const cleaned = val.replace(/[^\w\s@.\-+()]/g, '');
            if (cleaned !== val) {
              issues.push({
                row: idx + 1,
                column: col,
                type: 'info',
                message: `Special characters removed`,
                originalValue: val,
                fixedValue: cleaned,
              });
              row[col] = cleaned;
              formattingFixed++;
            }
          });
        }
        break;
      }

      case 'filter_rows': {
        const conditions = step.params?.conditions ?? [];
        if (conditions.length > 0) {
          const beforeCount = cleanedData.length;
          cleanedData = cleanedData.filter((row) => {
            for (const cond of conditions) {
              const val = parseFloat(String(row[cond.column] ?? ''));
              if (isNaN(val)) continue;
              switch (cond.operator) {
                case '>': if (!(val > cond.value)) return false; break;
                case '>=': if (!(val >= cond.value)) return false; break;
                case '<': if (!(val < cond.value)) return false; break;
                case '<=': if (!(val <= cond.value)) return false; break;
                case '=': if (!(val === cond.value)) return false; break;
                case '!=': if (!(val !== cond.value)) return false; break;
              }
            }
            return true;
          });
          const removed = beforeCount - cleanedData.length;
          if (removed > 0) {
            issues.push({
              row: 0,
              column: '',
              type: 'warning',
              message: `${removed} rows removed by filter conditions`,
              originalValue: '',
            });
          }
        }
        break;
      }
    }
  }

  return {
    originalRows: data.length,
    cleanedRows: cleanedData.length,
    duplicatesRemoved,
    invalidEmailsFixed,
    missingValuesFilled,
    formattingFixed,
    issuesFound: issues,
    cleanedData,
    columns: analyzeColumns(cleanedData),
  };
}

export function autoDetectCleaningSteps(columns: ColumnInfo[]): CleaningStep[] {
  const steps: CleaningStep[] = [];
  let stepId = 1;

  steps.push({
    id: `step-${stepId++}`,
    action: 'remove_empty_rows',
    description: 'Remove completely empty rows',
    enabled: true,
  });

  for (const col of columns) {
    if (col.type === 'email') {
      steps.push({
        id: `step-${stepId++}`,
        action: 'validate_email',
        column: col.name,
        description: `Validate & fix email format in "${col.name}"`,
        enabled: true,
      });
      steps.push({
        id: `step-${stepId++}`,
        action: 'remove_duplicates',
        column: col.name,
        description: `Remove duplicate rows by "${col.name}"`,
        enabled: true,
      });
    }

    if (col.type === 'phone') {
      steps.push({
        id: `step-${stepId++}`,
        action: 'validate_phone',
        column: col.name,
        params: { country: 'auto', addCountryCode: false },
        description: `Validate & format phone numbers in "${col.name}" with country-aware rules`,
        enabled: true,
      });
    }

    if (col.type === 'string' && col.name.toLowerCase().match(/name|title|city|address|company/)) {
      steps.push({
        id: `step-${stepId++}`,
        action: 'text_transform',
        column: col.name,
        params: { transformation: 'title_case' },
        description: `Convert "${col.name}" to Title Case`,
        enabled: true,
      });
    }

    if (col.type === 'date') {
      steps.push({
        id: `step-${stepId++}`,
        action: 'standardize_date',
        column: col.name,
        description: `Standardize date format in "${col.name}" to YYYY-MM-DD`,
        enabled: true,
      });
    }

    if (col.nullCount > 0) {
      const fillMethod = col.type === 'number' ? 'mean' : 'constant';
      const fillValue = col.type === 'number' ? '' : 'N/A';
      steps.push({
        id: `step-${stepId++}`,
        action: 'fill_missing',
        column: col.name,
        params: { method: fillMethod, value: fillValue },
        description: `Fill ${col.nullCount} missing values in "${col.name}" (${fillMethod})`,
        enabled: col.nullCount > 0,
      });
    }

    steps.push({
      id: `step-${stepId++}`,
      action: 'remove_whitespace',
      column: col.name,
      description: `Remove extra whitespace from "${col.name}"`,
      enabled: true,
    });
  }

  return steps;
}

export function generateCSV(data: DataRow[]): string {
  if (data.length === 0) return '';
  const columns = Object.keys(data[0]);
  const header = columns.map(c => `"${c}"`).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}
