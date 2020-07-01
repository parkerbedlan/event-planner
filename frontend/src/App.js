import React, { useContext, useEffect, useReducer } from 'react'
import { Auth0Context } from './contexts/auth0-context'
import styled from 'styled-components'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { VerificationPage } from './pages/VerificationPage'
import { HomePage } from './pages/HomePage'

import { signIn } from './phpHelper'
// import useAsyncReducer from './asyncReducer'

const LoadingScreen = styled.div`
  width: 100%;
  height: 100vh;
  background: url(${require('./images/loading.gif')}) center center no-repeat;
`

export function init(authUser) {
  console.log('signIn', authUser.signIn)
  if (authUser.signIn) {
    signIn(authUser).then(res => console.log(res))
  }

  if (!authUser.email_verified) {
    console.log('init rejected')
    return { email_verified: false, signIn: false, potato: 1 }
  }
  console.log('init accepted')

  // todo: handling caching should happen here

  return { email_verified: true, signIn: false }
}

function reducer(state, action) {
  // if (!state.email_verified) return { ...state }
  switch (action.type) {
    case 'init':
      return init(action.authUser)
    case 'test':
      console.log('action working!')
      break
    default:
      throw new Error()
  }
}

export const EventPlannerDispatch = React.createContext()

function App() {
  const { isAuthLoading, user } = useContext(Auth0Context)
  const [state, dispatch] = useReducer(
    reducer,
    { email_verified: false, signIn: false, potato: 0 },
    init
  )

  useEffect(() => {
    console.log(user)
    console.log(state)
  })

  return (
    <EventPlannerDispatch.Provider value={dispatch}>
      <Layout>
        {(isAuthLoading || state.isLoading) && <LoadingScreen />}
        {!isAuthLoading && !user && <LoginPage />}
        {!isAuthLoading && user && !user.email_verified && <VerificationPage />}
        {!isAuthLoading && user && user.email_verified && !state.currentEvent && (
          <>
            <Router>
              <Switch>
                <Route exact path="/">
                  <HomePage />
                </Route>
              </Switch>
            </Router>
          </>
        )}
        {/* <img id="image1" alt="profile pic" /> */}
      </Layout>
    </EventPlannerDispatch.Provider>
  )
}

export default App
