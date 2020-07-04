import React, { useContext, useEffect, useState } from 'react'
import { Auth0Context } from './contexts/auth0-context'
import styled from 'styled-components'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { VerificationPage } from './pages/VerificationPage'
import { HomePage } from './pages/HomePage'

import AppUser from './classes/AppUser'
import { getPHP } from './phpHelper'

const LoadingScreen = styled.div`
  width: 100%;
  height: 100vh;
  background: url(${require('./images/loading.gif')}) center center no-repeat;
`

// pulls data from server if not in cache
async function getAppData(authUser) {
  const appUser = await AppUser.fetch(authUser.email)
  await getPHP('setCache', {
    emailAddr: appUser.emailAddr,
    jsonData: JSON.stringify(appUser),
  })
  return { isLoading: false, currentEvent: null, appUser }
}

export const AppState = React.createContext()

function App() {
  const { isAuthLoading, user } = useContext(Auth0Context)
  const [state, setState] = useState({ potatoDebug: -1 })

  useEffect(() => {
    console.log(user)
    if (user && user.email_verified) {
      setState({ isLoading: true })
      getPHP('getCache', { emailAddr: user.email })
        .then(res1 => {
          setState({
            isLoading: false,
            currentEvent: null,
            appUser: JSON.parse(res1),
          })
        })
        .then(
          getAppData(user).then(res => {
            console.log('loaded')
            setState(res)
          })
        )
    }
  }, [user])

  return (
    <AppState.Provider value={{ state, setState }}>
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
        {JSON.stringify(state)}
      </Layout>
    </AppState.Provider>
  )
}

export default App
