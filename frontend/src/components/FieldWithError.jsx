import React from 'react'
import { useField } from 'formik'
import Alert from 'react-bootstrap/Alert'
import FormBS from 'react-bootstrap/Form'

const FieldWithError = ({
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

export default FieldWithError
