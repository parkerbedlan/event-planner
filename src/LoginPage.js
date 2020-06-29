import React, { useContext } from 'react'
import { Auth0Context } from './contexts/auth0-context'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components'

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

export function LoginPage() {
  const { loginWithRedirect } = useContext(Auth0Context)

  return (
    <Styles>
      <h1>Log in to access Event Planner.</h1>
      <Button size="lg" onClick={loginWithRedirect}>
        Log in
      </Button>
      <hr />
      <h3>Landing page information</h3>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ac quam
        mi. Mauris enim felis, auctor fringilla fermentum eu, pulvinar vel urna.
        Fusce auctor ultrices lacus, non pretium sem sollicitudin quis. Maecenas
        fringilla, turpis vel pulvinar gravida, dolor diam laoreet orci, ut
        volutpat risus mi et nisl. Suspendisse libero orci, pretium et felis
        quis, suscipit ornare dolor. Donec vestibulum risus et elit rutrum, et
        scelerisque magna congue. Interdum et malesuada fames ac ante ipsum
        primis in faucibus. Curabitur elementum non dui quis ullamcorper. Aenean
        quis nulla metus.
      </p>
      <p>
        Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus
        dignissim in libero sit amet dapibus. Duis lorem eros, tincidunt sed
        blandit ut, scelerisque elementum risus. Vivamus vel lacinia nisi. Donec
        eu tellus ac nibh maximus placerat. Praesent non libero nec nulla
        elementum egestas. Interdum et malesuada fames ac ante ipsum primis in
        faucibus. Mauris et quam odio. Duis vel nisi quis neque luctus luctus
        quis ut lorem. Phasellus suscipit tempus lorem, ultrices eleifend neque
        facilisis quis. Donec sed venenatis ante. Vestibulum eu tincidunt ipsum.
        Duis lobortis vestibulum risus id congue. Duis placerat efficitur dui, a
        pellentesque ante volutpat vel.
      </p>
    </Styles>
  )
}
