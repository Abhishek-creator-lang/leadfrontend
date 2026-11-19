import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';

/** Compact multi-select dropdown; renders nothing when there are no options. */
export function MultiSelect({
  label,
  value,
  options,
  onChange,
  render = (v) => v,
}: {
  label: string;
  value: string[];
  options: readonly string[];
  onChange: (v: string[]) => void;
  render?: (v: string) => string;
}) {
  if (!options.length) return null;
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={(e) =>
          onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
        }
        input={<OutlinedInput label={label} />}
        renderValue={(sel) => (sel.length === 1 ? render(sel[0]) : `${sel.length} selected`)}
        MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
      >
        {options.map((o) => (
          <MenuItem key={o} value={o}>
            {render(o)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
