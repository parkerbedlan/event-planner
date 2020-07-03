import React, { useContext, useState } from 'react'
import { Auth0Context } from '../contexts/auth0-context'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'
import { AppState } from '../App'
import AppUser from '../classes/AppUser'

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

// todo: special Toasts message if no events
export function HomePage(props) {
  const [debugMsg, setDebugMsg] = useState('no debug message yet')
  const [objTest, setObjTest] = useState({ potato: 'poetahtoe' })
  const { logout, user } = useContext(Auth0Context)

  const { setState } = useContext(AppState)
  return (
    <Styles>
      <h1>You're signed in.</h1>
      <Button onClick={logout} size="lg">
        Log out
      </Button>
      <br />
      <Button
        onClick={async () => {
          setDebugMsg('Loading...')
          const appUser = await AppUser.fetch(user.email)
          setDebugMsg(JSON.stringify(appUser))
          setObjTest(appUser)
        }}
        variant="secondary"
      >
        Debug
      </Button>
      <p>{debugMsg}</p>
      <Button variant="danger">
        Add a silent 'q' to the end of your first name
      </Button>
    </Styles>
  )
}
