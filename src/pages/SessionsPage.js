import React, { useContext } from 'react'
import { Auth0Context } from '../contexts/auth0-context'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

// special message if no events
export function SessionsPage() {
  const { logout } = useContext(Auth0Context)
  return (
    <Styles>
      <h1>You're signed in.</h1>
      <Button onClick={logout} size="lg">
        Log out
      </Button>
    </Styles>
  )
}
