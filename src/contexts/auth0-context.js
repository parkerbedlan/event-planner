import React, { Component, createContext } from 'react'
import createAuth0Client from '@auth0/auth0-spa-js'
import { init } from '../App'

export const Auth0Context = createContext()

export class Auth0Provider extends Component {
  state = {
    auth0Client: null,
    isAuthLoading: true,
    isAuthenticated: false,
    user: null,
  }

  // from manage.auth0.com
  config = {
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirect_uri: window.location.origin,
  }

  componentDidMount() {
    try {
      this.initializeAuth0()
    } catch {
      this.setState({ isAuthLoading: false })
    }
  }

  initializeAuth0 = async () => {
    const auth0Client = await createAuth0Client(this.config)
    this.setState({ auth0Client })

    if (window.location.search.includes('code=')) {
      return this.handleRedirectCallback()
    }

    const isAuthenticated = await auth0Client.isAuthenticated()
    const user = isAuthenticated ? await auth0Client.getUser() : null

    if (user) {
      console.log('refresh')
      init({ ...user, signIn: false })
    }

    this.setState({ isAuthLoading: false, isAuthenticated, user })
  }

  handleRedirectCallback = async () => {
    this.setState({ isAuthLoading: true })
    await this.state.auth0Client.handleRedirectCallback()
    const user = await this.state.auth0Client.getUser()
    init({ ...user, signIn: true })
    this.setState({ user, isAuthenticated: true, isAuthLoading: false })
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  render() {
    const { auth0Client, isAuthLoading, isAuthenticated, user } = this.state
    const { children } = this.props

    const configObject = {
      isAuthLoading,
      isAuthenticated,
      user,
      loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
      getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
      getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
      logout: (...p) => auth0Client.logout(...p),
    }

    return (
      <Auth0Context.Provider value={configObject}>
        {children}
      </Auth0Context.Provider>
    )
  }
}
