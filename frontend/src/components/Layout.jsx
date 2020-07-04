import React from 'react'
import Container from 'react-bootstrap/Container'

export default function Layout(props) {
  return <Container>{props.children}</Container>
}
