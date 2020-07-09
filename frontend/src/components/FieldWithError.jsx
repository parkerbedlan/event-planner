import React from 'react'
import { useField } from 'formik'
import { Alert, Form as FormBS } from 'react-bootstrap'

export const FieldWithError = ({
  placeholder,
  style,
  className,
  type,
  as,
  ...props
}) => {
  const [field, { error, touched }] = useField(props)
  return (
    <FormBS.Group>
      {placeholder && <strong>{placeholder}: </strong>}
      <FormBS.Control
        placeholder={placeholder}
        style={style}
        className={className}
        as={as}
        type={type}
        {...field}
      />
      {error && touched && <Alert variant="danger">{error}</Alert>}
    </FormBS.Group>
  )
}
