"use client";

import * as React from "react";
import Datepicker from 'react-tailwindcss-datepicker'
import {DateValueType} from 'react-tailwindcss-datepicker/dist/types'
import { cn } from "@/lib/utils";

interface DateFieldProps {
  label: string;
  value: DateValueType;
  onChange: (value: DateValueType) => void;
  className?: string;
  placeholder?: string;
}

function DateField({
  label,
  value,
  onChange,
  className,
  placeholder,
  ...props
}: DateFieldProps) {
  return (
    <div className="flex pb-6 flex-col">
       {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
       )}
       <div id="datepicker-wrapper" className="relative w-full">
        <Datepicker
            placeholder={placeholder}
        />
       </div>
    </div>
  );
}

export { DateField };



