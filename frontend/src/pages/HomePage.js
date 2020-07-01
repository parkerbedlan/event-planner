import React, { useContext } from 'react'
import { Auth0Context } from '../contexts/auth0-context'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'
// import { signIn } from '../phpHelper'
// import EventPlannerDispatch from '../App'

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

// todo: special Toasts message if no events
export function HomePage() {
  // const { user } = useContext(Auth0Context)
  // signIn(user).then(res => console.log(res))

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
