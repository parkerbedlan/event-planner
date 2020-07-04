import React, { useContext, useState } from 'react'
import { Auth0Context } from '../contexts/auth0-context'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'
import { AppState } from '../App'
import AppUser from '../classes/AppUser'
import { getPHP, blobToUrl } from '../phpHelper'

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

// todo: special Toasts message if no events
export default function TestPage(props) {
  const [debugMsg, setDebugMsg] = useState('no debug message yet')
  const [objTest, setObjTest] = useState({ potato: 'poetahtoe' })
  const { logout, user } = useContext(Auth0Context)

  const { setState, state } = useContext(AppState)
  return (
    <Styles>
      <h1>You're signed in.</h1>
      <Button onClick={logout} size="lg">
        Log out
      </Button>
      <br />
      <Button
        onClick={() => {
          setDebugMsg(blobToUrl(state.appUser.profilePic))
        }}
        variant="secondary"
      >
        Debug
      </Button>
      <p>{debugMsg}</p>

      {/* <Button
        onClick={async () => {
          await getPHP('setUserFirstName', {
            emailAddr: state.appUser.emailAddr,
            firstName: state.appUser.firstName + 'q',
          })
          setState({
            ...state,
            appUser: {
              ...state.appUser,
              firstName: state.appUser.firstName + 'q',
            },
          })
          await getPHP('setCache', {
            emailAddr: state.appUser.emailAddr,
            jsonData: state.appUser,
          })
        }}
        variant="danger"
      >
        Add a silent 'q' to the end of your first name
      </Button> */}
      {/* {JSON.stringify(state)} */}
    </Styles>
  )
}
