import React, { useContext, useState } from 'react'
import { Nav, Navbar, Image, NavDropdown, Button, Modal } from 'react-bootstrap'
import { blobToUrl } from '../phpHelper'
import { Auth0Context } from '../contexts/auth0-context'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

export default function NavigationBar({ profilePic, adminEvents }) {
  return (
    <>
      <Navbar fixed="top" bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">
          <img
            src={require('../images/logo.png')}
            width="30"
            height="30"
            alt="logo"
          />
        </Navbar.Brand>

        {Boolean(window.location.pathname !== '/') ? (
          <>
            {Boolean(adminEvents) && (
              <Nav className="mr-auto">
                {/* <Nav.Link href="/">
                  <h5>
                    {adminEvents[cookies.get('currentEventId')].shortTitle}
                  </h5>
                </Nav.Link> */}
                <EventDropdown adminEvents={adminEvents} />
              </Nav>
            )}
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
      <div style={{ marginTop: '6em' }} />
    </>
  )
}

function EventDropdown({ adminEvents }) {
  return (
    <NavDropdown title={adminEvents[cookies.get('currentEventId')].shortTitle}>
      {Object.values(adminEvents).map(event => {
        return (
          <NavDropdown.Item
            onClick={() => {
              cookies.set('currentEventId', event.id)
              window.location.reload()
            }}
          >
            {/*eslint-disable-next-line*/}
            {event.id == cookies.get('currentEventId') ? (
              <strong>{event.shortTitle}</strong>
            ) : (
              event.shortTitle
            )}
          </NavDropdown.Item>
        )
      })}
      <NavDropdown.Divider />
      <NavDropdown.Item href="/">View all Events</NavDropdown.Item>
    </NavDropdown>
  )
}

function ProfileDropdown({ profilePic }) {
  const { logout } = useContext(Auth0Context)
  const [show, setShow] = useState(false)
  return (
    <>
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
        alignRight
      >
        <NavDropdown.Item onClick={() => setShow(true)}>
          <Button variant="secondary">Edit profile</Button>
        </NavDropdown.Item>
        <NavDropdown.Item
          onClick={() => {
            cookies.remove('currentEventId')
            logout()
          }}
        >
          <Button variant="danger">Log Off</Button>
        </NavDropdown.Item>
      </NavDropdown>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <h4>Edit Profile</h4>
        </Modal.Header>
        <h1>Edit your profile here</h1>
        <Modal.Footer>
          <Button onClick={() => setShow(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={() => setShow(false)}>Save changes</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
