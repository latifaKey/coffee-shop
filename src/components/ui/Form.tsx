import React from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// FORM GROUP - Consistent form field wrapper
// =====================================================
interface FormGroupProps {
  label: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ 
  label, 
  required = false, 
  error, 
  helper, 
  children, 
  className 
}: FormGroupProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-semibold text-[#F7F2EE]">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {helper && !error && (
        <small className="text-xs text-[#B6B3AC]">{helper}</small>
      )}
      {error && (
        <small className="text-xs text-red-400">{error}</small>
      )}
    </div>
  );
}

// =====================================================
// INPUT - Consistent text input
// =====================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 rounded-lg",
          "bg-white/[0.04] border text-[#F7F2EE]",
          "outline-none transition-all duration-200",
          "placeholder:text-[#B6B3AC]",
          error 
            ? "border-red-500/50 focus:border-red-500" 
            : "border-white/[0.14] focus:border-[#8B4513]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// =====================================================
// TEXTAREA - Consistent textarea
// =====================================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 rounded-lg",
          "bg-white/[0.04] border text-[#F7F2EE]",
          "outline-none transition-all duration-200",
          "placeholder:text-[#B6B3AC]",
          "resize-y min-h-[100px]",
          error 
            ? "border-red-500/50 focus:border-red-500" 
            : "border-white/[0.14] focus:border-[#8B4513]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

// =====================================================
// SELECT - Consistent select dropdown
// =====================================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 rounded-lg",
          "bg-white/[0.04] border text-[#F7F2EE]",
          "outline-none transition-all duration-200",
          error 
            ? "border-red-500/50 focus:border-red-500" 
            : "border-white/[0.14] focus:border-[#8B4513]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "cursor-pointer",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-[#1D1714] text-[#F7F2EE]"
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

// =====================================================
// FILE INPUT - Consistent file upload
// =====================================================
interface FileInputProps {
  accept?: string;
  onChange: (file: File | null) => void;
  error?: boolean;
  preview?: string | null;
  maxSize?: number; // in MB
  className?: string;
}

export function FileInput({ 
  accept, 
  onChange, 
  error, 
  preview, 
  maxSize = 5,
  className 
}: FileInputProps) {
  const [fileName, setFileName] = React.useState<string>('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onChange(null);
      setFileName('');
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File terlalu besar. Maksimal ${maxSize}MB`);
      e.target.value = '';
      return;
    }

    setFileName(file.name);
    onChange(file);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
            "bg-white/[0.05] border text-[#F7F2EE]",
            error 
              ? "border-red-500/50 hover:border-red-500" 
              : "border-white/[0.14] hover:border-[#8B4513]"
          )}
        >
          📁 Pilih File
        </button>
        {fileName && (
          <span className="flex items-center text-sm text-[#B6B3AC] px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.08]">
            {fileName}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {preview && (
        <div className="mt-2 rounded-lg overflow-hidden border border-white/[0.08] max-w-xs">
          <img src={preview} alt="Preview" className="w-full h-auto" />
        </div>
      )}
    </div>
  );
}

// =====================================================
// CHECKBOX - Consistent checkbox
// =====================================================
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "w-4 h-4 rounded border-white/[0.14] bg-white/[0.04]",
            "text-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/50",
            "cursor-pointer transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        <span className="text-sm text-[#F7F2EE] group-hover:text-[#D4A574] transition-colors">
          {label}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// =====================================================
// RADIO GROUP - Consistent radio buttons
// =====================================================
interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RadioGroup({ 
  name, 
  options, 
  value, 
  onChange, 
  className 
}: RadioGroupProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {options.map((option) => (
        <label 
          key={option.value} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 border-white/[0.14] bg-white/[0.04] text-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/50 cursor-pointer"
          />
          <span className="text-sm text-[#F7F2EE] group-hover:text-[#D4A574] transition-colors">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

// =====================================================
// FORM SECTION - Group related fields
// =====================================================
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className 
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="border-b border-white/[0.08] pb-3">
        <h3 className="text-lg font-semibold text-[#D4A574]">{title}</h3>
        {description && (
          <p className="text-sm text-[#B6B3AC] mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
