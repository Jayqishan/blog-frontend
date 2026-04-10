import { useState } from 'react';

export default function FormInput({
  label,
  hint,
  multiline = false,
  className = '',
  canTogglePassword = false,
  ...props
}) {
  const Element = multiline ? 'textarea' : 'input';
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = !multiline && props.type === 'password';
  const inputType = isPassword && canTogglePassword ? (showPassword ? 'text' : 'password') : props.type;

  return (
    <label className={`form-input ${className}`}>
      {label ? <span className="form-input__label">{label}</span> : null}
      <span className={`field-wrap ${isPassword && canTogglePassword ? 'field-wrap--password' : ''}`}>
        <Element className="field react-field" {...props} type={inputType} />
        {isPassword && canTogglePassword ? (
          <button
            type="button"
            className="field-eye"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        ) : null}
      </span>
      {hint ? <span className="form-input__hint">{hint}</span> : null}
    </label>
  );
}
