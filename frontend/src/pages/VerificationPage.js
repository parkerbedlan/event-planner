import React from 'react'
import styled from 'styled-components'

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`
//make it a <ol>
export function VerificationPage() {
  return (
    <Styles>
      <h1>Next steps:</h1>
      <h2>
        <ol>
          <li>Check your email and click "Verify your account"</li>
          <li>Come back and refresh this page</li>
        </ol>
      </h2>
      <br />
      <h5>
        No hard feelings, we just want to make sure you are who you say you are.
      </h5>
    </Styles>
  )
}
