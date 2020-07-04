import React, { useContext } from 'react'
import { Nav, Navbar, Image, NavDropdown, Button } from 'react-bootstrap'
import { blobToUrl } from '../phpHelper'
import styled from 'styled-components'
import { Auth0Context } from '../contexts/auth0-context'

const Styles = styled.div``

export default function NavigationBar({ currentEvent, profilePic }) {
  return (
    <Styles>
      <Navbar fixed="top" bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">
          <img
            src={require('../images/logo.png')}
            width="30"
            height="30"
            alt="logo"
          />
        </Navbar.Brand>

        {Boolean(currentEvent) ? (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="justify-content-end"
            >
              <Nav className="ml-auto">
                <Nav.Link href="/sessions">
                  <h5>Sessions</h5>
                </Nav.Link>
                <Nav.Link href="/admins">
                  <h5>Admins</h5>
                </Nav.Link>
                <Nav.Link href="/participants">
                  <h5>Participants</h5>
                </Nav.Link>
                <Nav.Link href="/notifications">
                  <h5>Notifications</h5>
                </Nav.Link>
                <ProfileDropdown profilePic={profilePic} />
              </Nav>
            </Navbar.Collapse>
          </>
        ) : (
          <Nav className="ml-auto">
            <ProfileDropdown profilePic={profilePic} className="ml-auto" />
          </Nav>
        )}
      </Navbar>
      <div style={{ marginTop: '5em' }} />
    </Styles>
  )
}

function ProfileDropdown({ profilePic }) {
  const { logout } = useContext(Auth0Context)
  return (
    <NavDropdown
      title={
        <Image
          src={
            Boolean(profilePic)
              ? blobToUrl(profilePic)
              : require('../images/profilePlaceholder.png')
          }
          width="30"
          height="30"
          alt="profile"
          roundedCircle
        />
      }
      id="profileDropdown"
      alignRight
    >
      <NavDropdown.Item href="/profile">
        <Button variant="secondary">Edit profile</Button>
      </NavDropdown.Item>
      <NavDropdown.Item onClick={logout}>
        <Button variant="danger">Log Off</Button>
      </NavDropdown.Item>
    </NavDropdown>
  )
}
