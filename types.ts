export interface DataRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'email' | 'phone' | 'date' | 'boolean' | 'unknown';
  nullCount: number;
  uniqueCount: number;
  sampleValues: string[];
  totalCount: number;
}

export interface CleaningStep {
  id: string;
  action: CleaningAction;
  column?: string;
  params?: Record<string, any>;
  description: string;
  enabled: boolean;
}

export type CleaningAction =
  | 'remove_duplicates'
  | 'fill_missing'
  | 'validate_email'
  | 'validate_phone'
  | 'text_transform'
  | 'remove_whitespace'
  | 'filter_rows'
  | 'standardize_date'
  | 'remove_empty_rows'
  | 'fix_encoding'
  | 'number_format'
  | 'remove_special_chars';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  steps: CleaningStep[];
  tags: string[];
  usageCount: number;
  rating: number;
  isPremium: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CleaningResult {
  originalRows: number;
  cleanedRows: number;
  duplicatesRemoved: number;
  invalidEmailsFixed: number;
  missingValuesFilled: number;
  formattingFixed: number;
  issuesFound: Issue[];
  cleanedData: DataRow[];
  columns: ColumnInfo[];
}

export interface Issue {
  row: number;
  column: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  originalValue: string;
  fixedValue?: string;
}

export type AppView = 'landing' | 'upload' | 'cleaning' | 'templates' | 'results' | 'pricing' | 'tools';
