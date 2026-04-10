export interface InputInterface {
  value: any;
  extraValue?: any;
  dummyValue?: any;
  values?: Array<any>;
  type: string;
  forceType?: string;
  extraComponent?: any;
  extraLeftComponent?: any;
  hasTopLabel?: boolean;
  label?: string;
  hasError?: boolean;
  placeholder?: string | "";
  maxLength?: number;
  name?: string;
  hasEye?: boolean;
  cols?: number;
  rows?: number;
  extraClass?: string;
  globalExtraClass?: string;
  errorMessage?: string;
  required?: boolean;
  hasSearch?: boolean;
  noUpdate?: boolean;
  hasPlaceholder?: boolean;
  id?: any;
  forceOnblur?: boolean;
  joinSwitch?: boolean;
  rightPlaceholder?: string;
  leftPlaceholder?: string;
  rightValue?: any;
  leftValue?: any;
  allowedFormats?: string[];
  maxSizeMB?: number;
  // Propiedades para QuantityCounter
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;

  //autocomplete
  freeSolo?: boolean;
  loading?: boolean;
  onSearch?: (q: string) => void;
  noOptionsText?: string;
  debounceMs?: number;
  minChars?: number;
  disableClearable?: boolean;
  getOptionLabel?: (opt: any) => string;

  // Propiedades para checkbox mode
  checkboxMode?: 'toggle' | 'single';
}

export interface CheckboxOption {
  value: string;
  label: string;
}
