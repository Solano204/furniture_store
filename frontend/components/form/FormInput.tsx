// THIS IS A NORMAL INPUT

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

type FormInputProps = {
  name?: string;
  type?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
};

function FormInput({
  label,
  name,
  type,
  defaultValue,
  placeholder,
  className,
}: FormInputProps) {
  return (
    <div className={cn("mb-2 ", className)}>
      <Label htmlFor={name} className="capitalize">
        {label || name}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export default FormInput;
