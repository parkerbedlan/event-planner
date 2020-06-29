import React, { useContext } from 'react'
import { Auth0Context } from './contexts/auth0-context'
import styled from 'styled-components'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { VerificationPage } from './pages/VerificationPage'
import { HomePage } from './pages/HomePage'
// import { SessionsPage } from './pages/SessionsPage'

const LoadingScreen = styled.div`
  width: 100%;
  height: 100vh;
  background: url(${require('./images/loading.gif')}) center center no-repeat;
`

function App() {
  const { isLoading, user } = useContext(Auth0Context)
  return (
    <>
      <Layout>
        {isLoading && <LoadingScreen />}
        {!isLoading && !user && <LoginPage />}
        {!isLoading && user && !user.email_verified && <VerificationPage />}
        {!isLoading && user && user.email_verified && (
          <>
            <Router>
              <Switch>
                <Route exact path="/" component={HomePage} />
              </Switch>
            </Router>
          </>
        )}
        {/* <img id="image1" alt="profile pic" /> */}
      </Layout>
    </>
  )
}

export default App
