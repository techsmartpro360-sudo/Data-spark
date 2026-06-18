export type PhoneCountryKey = 'auto' | 'US' | 'IN' | 'UK' | 'AE' | 'PK' | 'AU';

export interface PhoneCountryPreset {
  key: PhoneCountryKey;
  label: string;
  dialCode: string;
  localLengths: number[];
  placeholder: string;
}

export const PHONE_COUNTRY_PRESETS: PhoneCountryPreset[] = [
  {
    key: 'auto',
    label: 'Auto detect',
    dialCode: '',
    localLengths: [],
    placeholder: 'Detect from existing values',
  },
  {
    key: 'US',
    label: 'United States / Canada',
    dialCode: '+1',
    localLengths: [10],
    placeholder: '+1 415 555 0123',
  },
  {
    key: 'IN',
    label: 'India',
    dialCode: '+91',
    localLengths: [10],
    placeholder: '+91 98765 43210',
  },
  {
    key: 'UK',
    label: 'United Kingdom',
    dialCode: '+44',
    localLengths: [10],
    placeholder: '+44 7700 900123',
  },
  {
    key: 'AE',
    label: 'UAE',
    dialCode: '+971',
    localLengths: [9],
    placeholder: '+971 50 123 4567',
  },
  {
    key: 'PK',
    label: 'Pakistan',
    dialCode: '+92',
    localLengths: [10],
    placeholder: '+92 300 1234567',
  },
  {
    key: 'AU',
    label: 'Australia',
    dialCode: '+61',
    localLengths: [9],
    placeholder: '+61 412 345 678',
  },
];

const PRESET_BY_KEY = Object.fromEntries(PHONE_COUNTRY_PRESETS.map((preset) => [preset.key, preset])) as Record<PhoneCountryKey, PhoneCountryPreset>;

export function getPhonePreset(key: PhoneCountryKey = 'auto'): PhoneCountryPreset {
  return PRESET_BY_KEY[key] || PRESET_BY_KEY.auto;
}

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function detectCountryFromDigits(digits: string): PhoneCountryKey {
  if (digits.startsWith('971')) return 'AE';
  if (digits.startsWith('92')) return 'PK';
  if (digits.startsWith('91')) return 'IN';
  if (digits.startsWith('44')) return 'UK';
  if (digits.startsWith('61')) return 'AU';
  if (digits.startsWith('1')) return 'US';
  if (digits.length === 10) return 'US';
  if (digits.length === 9) return 'AE';
  return 'US';
}

function trimCountryPrefix(digits: string, country: PhoneCountryKey): string {
  switch (country) {
    case 'US':
      return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
    case 'IN':
      return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.replace(/^0/, '');
    case 'UK':
      if (digits.length === 12 && digits.startsWith('44')) return digits.slice(2);
      if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
      return digits;
    case 'AE':
      if (digits.length === 12 && digits.startsWith('971')) return digits.slice(3);
      if (digits.length === 10 && digits.startsWith('0')) return digits.slice(1);
      return digits;
    case 'PK':
      if (digits.length === 12 && digits.startsWith('92')) return digits.slice(2);
      if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
      return digits;
    case 'AU':
      if (digits.length === 11 && digits.startsWith('61')) return digits.slice(2);
      if (digits.length === 10 && digits.startsWith('0')) return digits.slice(1);
      return digits;
    default:
      return digits;
  }
}

export function isPhoneLengthValid(digits: string, country: PhoneCountryKey): boolean {
  if (country === 'auto') {
    return digits.length >= 7 && digits.length <= 15;
  }

  const preset = getPhonePreset(country);
  const localDigits = trimCountryPrefix(digits, country);
  return preset.localLengths.includes(localDigits.length);
}

export function formatPhoneNumber(
  value: string,
  country: PhoneCountryKey = 'auto',
  addCountryCode = false
): { valid: boolean; formatted: string; detectedCountry: PhoneCountryKey } {
  const digits = normalizePhoneDigits(value);
  if (!digits) {
    return { valid: false, formatted: '', detectedCountry: country === 'auto' ? 'US' : country };
  }

  const resolvedCountry = country === 'auto' ? detectCountryFromDigits(digits) : country;
  const localDigits = trimCountryPrefix(digits, resolvedCountry);
  const valid = isPhoneLengthValid(digits, resolvedCountry);

  if (!valid) {
    return {
      valid: false,
      formatted: value,
      detectedCountry: resolvedCountry,
    };
  }

  const preset = getPhonePreset(resolvedCountry);
  const includeCode = addCountryCode || digits.startsWith(preset.dialCode.replace('+', ''));

  let formatted = localDigits;

  switch (resolvedCountry) {
    case 'US':
      formatted = `${localDigits.slice(0, 3)}-${localDigits.slice(3, 6)}-${localDigits.slice(6, 10)}`;
      break;
    case 'IN':
      formatted = `${localDigits.slice(0, 5)} ${localDigits.slice(5, 10)}`;
      break;
    case 'UK':
      formatted = `${localDigits.slice(0, 4)} ${localDigits.slice(4, 7)} ${localDigits.slice(7, 10)}`;
      break;
    case 'AE':
      formatted = `${localDigits.slice(0, 2)} ${localDigits.slice(2, 5)} ${localDigits.slice(5, 9)}`;
      break;
    case 'PK':
      formatted = `${localDigits.slice(0, 3)} ${localDigits.slice(3, 10)}`;
      break;
    case 'AU':
      formatted = `${localDigits.slice(0, 3)} ${localDigits.slice(3, 6)} ${localDigits.slice(6, 9)}`;
      break;
  }

  return {
    valid,
    formatted: includeCode ? `${preset.dialCode} ${formatted}` : formatted,
    detectedCountry: resolvedCountry,
  };
}
