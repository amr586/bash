import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSiteSettings } from "@/lib/site-settings";

const CUSTOM_VALUE = "__custom__";

interface Props {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  helpText?: string;
  testIdPrefix?: string;
}

export function LocationField({
  value,
  onChange,
  required,
  helpText,
  testIdPrefix = "loc",
}: Props) {
  const { settings, loading } = useSiteSettings();
  const knownLocations = useMemo(
    () => settings.locations ?? [],
    [settings.locations],
  );

  const isKnown = value.trim() !== "" && knownLocations.includes(value);
  const initialMode: "select" | "custom" =
    value.trim() === "" ? "select" : isKnown ? "select" : "custom";

  const [mode, setMode] = useState<"select" | "custom">(initialMode);

  useEffect(() => {
    if (loading) return;
    if (value.trim() === "") {
      setMode("select");
    } else if (knownLocations.includes(value)) {
      setMode("select");
    } else {
      setMode("custom");
    }
  }, [knownLocations, value, loading]);

  function handleSelectChange(v: string) {
    if (v === CUSTOM_VALUE) {
      setMode("custom");
      onChange("");
    } else {
      setMode("select");
      onChange(v);
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${testIdPrefix}-location-select`}>المنطقة *</Label>

      <Select
        value={mode === "custom" ? CUSTOM_VALUE : value || ""}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger
          id={`${testIdPrefix}-location-select`}
          data-testid={`select-${testIdPrefix}-location`}
        >
          <SelectValue placeholder="اختر منطقة" />
        </SelectTrigger>
        <SelectContent>
          {knownLocations.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_VALUE}>منطقة أخرى (أكتب يدوي)</SelectItem>
        </SelectContent>
      </Select>

      {mode === "custom" && (
        <Input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="اكتب اسم المنطقة"
          maxLength={200}
          required={required}
          data-testid={`input-${testIdPrefix}-location-custom`}
        />
      )}

      {helpText && (
        <p className="text-xs text-foreground/60">{helpText}</p>
      )}
    </div>
  );
}
