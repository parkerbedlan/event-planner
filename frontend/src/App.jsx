import React, { useContext, useState, useEffect } from 'react'
import { Auth0Context } from './contexts/auth0-context'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import LoginPage from './pages/LoginPage'
import VerificationPage from './pages/VerificationPage'
import NoMatchPage from './pages/NoMatchPage'
import EventsPage from './pages/EventsPage'
import SessionsPage from './pages/SessionsPage'
import UsersPage from './pages/UsersPage'
import GroupsPage from './pages/GroupsPage'

import NavigationBar from './components/NavigationBar'

export const AppUser = React.createContext()

export default function App() {
  const { isAuthLoading, user } = useContext(Auth0Context)
  const [appUser, setAppUser] = useState({ emailAddr: null })
  useEffect(() => {
    if (user) setAppUser({ emailAddr: user.email })
  }, [user])

  return (
    <AppUser.Provider value={{ appUser, setAppUser }}>
      <Layout>
        {isAuthLoading && <LoadingScreen />}
        {!isAuthLoading && !user && <LoginPage />}
        {!isAuthLoading && user && !user.email_verified && <VerificationPage />}
        {!isAuthLoading && user && user.email_verified && (
          <>
            <NavigationBar />
            <Router>
              <Switch>
                <Route exact path="/">
                  <EventsPage />
                </Route>
                <Route path="/sessions">
                  <SessionsPage />
                </Route>
                <Route path="/admins">
                  <UsersPage isAdmin={true} />
                </Route>
                <Route path="/participants">
                  <UsersPage isAdmin={false} />
                </Route>
                <Route path="/groups">
                  <GroupsPage />
                </Route>
                <Route component={NoMatchPage} />
              </Switch>
            </Router>
            <br />
          </>
        )}
      </Layout>
    </AppUser.Provider>
  )
}
