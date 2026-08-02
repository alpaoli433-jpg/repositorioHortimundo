'use client'

import { NumericFormat, type NumberFormatValues } from 'react-number-format'

type NumeroInputProps = {
  value: number | ''
  onChange: (value: number | '') => void
  decimales?: number
  permitirNegativos?: boolean
  required?: boolean
  min?: number
  placeholder?: string
  id?: string
  className?: string
  style?: React.CSSProperties
  prefix?: string
  suffix?: string
}

export default function NumeroInput({
  value,
  onChange,
  decimales = 0,
  permitirNegativos = false,
  ...resto
}: NumeroInputProps) {
  function handleValueChange(values: NumberFormatValues) {
    onChange(values.floatValue ?? '')
  }

  return (
    <NumericFormat
      value={value}
      onValueChange={handleValueChange}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={decimales}
      allowNegative={permitirNegativos}
      {...resto}
    />
  )
}
