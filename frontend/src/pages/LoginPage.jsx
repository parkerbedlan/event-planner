import React, { useContext } from 'react'
import { Auth0Context } from '../contexts/auth0-context'
import Button from 'react-bootstrap/Button'
import Jumbotron from 'react-bootstrap/Jumbotron'

export default function LoginPage() {
  const { loginWithRedirect } = useContext(Auth0Context)
  return (
    <>
      <br />
      <Jumbotron>
        <h3>
          Event Planner is a mobile-friendly web app for managing and scheduling
          an online multisession event, whether that be an online training,
          internship, hackathon, or summer camp.
        </h3>
      </Jumbotron>
      <hr />
      <h1>Log in to access Event Planner.</h1>
      <Button className="mt-3" size="lg" onClick={loginWithRedirect}>
        Log in
      </Button>
    </>
  )
}
