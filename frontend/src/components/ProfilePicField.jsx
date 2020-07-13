import React from 'react'
import { useField, useFormikContext } from 'formik'
import { blobToUrl, resizeImage } from '../phpHelper'
import { Form as FormBS, Image } from 'react-bootstrap'

export const ProfilePicField = ({ placeholder, ...props }) => {
  const [{ value, onChange, ...field }] = useField(props)
  const { setFieldValue } = useFormikContext()
  return (
    <>
      <FormBS.Control
        type="file"
        onChange={async e => {
          setFieldValue(
            field.name,
            await resizeImage({ file: e.currentTarget.files[0], maxSize: 120 })
          )
        }}
        {...field}
      ></FormBS.Control>
      <br />
      <Image
        src={!!value ? blobToUrl(value) : placeholder}
        width="100"
        height="100"
        alt={field.name}
        rounded
      />
    </>
  )
}
