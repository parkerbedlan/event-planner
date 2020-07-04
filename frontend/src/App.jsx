import React, { useContext, useEffect, useState } from 'react'
import { Auth0Context } from './contexts/auth0-context'
import styled from 'styled-components'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import VerificationPage from './pages/VerificationPage'
// import { TestPage } from './pages/TestPage'
import NoMatchPage from './pages/NoMatchPage'
import EventsPage from './pages/EventsPage'
import SessionsPage from './pages/SessionsPage'

import AppUser from './classes/AppUser'
import { getPHP } from './phpHelper'
import NavigationBar from './components/NavigationBar'

const LoadingScreen = styled.div`
  width: 100%;
  height: 100vh;
  background: url(${require('./images/loading.gif')}) center center no-repeat;
`

async function getAppData(authUser) {
  const appUser = await AppUser.fetch(authUser.email)
  await getPHP('setCache', {
    emailAddr: appUser.emailAddr,
    jsonData: JSON.stringify(appUser),
  })
  return appUser
}

export const AppState = React.createContext()

function App() {
  const { isAuthLoading, user } = useContext(Auth0Context)
  const [state, setState] = useState({})

  useEffect(() => {
    if (user && user.email_verified) {
      setState({ isLoading: true })
      async function f() {
        const appUserCached = await getPHP('getCache', {
          emailAddr: user.email,
        })
        const appUserProfilePic = await getPHP(
          'getProfilePic',
          { emailAddr: user.email },
          'blob'
        )
        setState({
          isLoading: false,
          updated: false,
          appUser: JSON.parse(appUserCached),
          appUserProfilePic,
        })
        const appUser = await getAppData(user)
        setState({
          isLoading: false,
          updated: true,
          appUser,
          appUserProfilePic: appUser.profilePic,
        })
      }
      f()
    }
  }, [user])

  useEffect(() => {
    if (state.updated) console.log('updated')
  }, [state.updated])

  return (
    <AppState.Provider value={{ state, setState }}>
      <Layout>
        {(isAuthLoading || state.isLoading) && <LoadingScreen />}
        {!isAuthLoading && !user && <LoginPage />}
        {!isAuthLoading && user && !user.email_verified && <VerificationPage />}
        {!isAuthLoading && user && user.email_verified && state.appUser && (
          <>
            <NavigationBar
              profilePic={state.appUserProfilePic}
              adminEvents={state.appUser.adminEvents}
            />
            <Router>
              <Switch>
                <Route exact path="/">
                  <EventsPage appUser={state.appUser} />
                </Route>
                <Route path="/sessions">
                  <SessionsPage appUser={state.appUser} />
                </Route>
                <Route component={NoMatchPage} />
              </Switch>
            </Router>
          </>
        )}
        {/* <img id="image1" alt="profile pic" /> */}
        {/* {JSON.stringify(state)} */}
      </Layout>
    </AppState.Provider>
  )
}

export default App
