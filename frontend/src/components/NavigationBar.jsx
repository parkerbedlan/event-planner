import React, { useContext, useState, useRef, useEffect } from 'react'
import {
  Nav,
  Navbar,
  Image,
  NavDropdown,
  Button,
  Modal,
  Form,
  Spinner,
} from 'react-bootstrap'
import { blobToUrl, getPHP, sanitize, resizeImage } from '../phpHelper'
import { Auth0Context } from '../contexts/auth0-context'
import Cookies from 'universal-cookie'
import { AppState, getAppData } from '../App'

const cookies = new Cookies()

export default function NavigationBar({ profilePic, adminEvents, updated }) {
  return (
    <>
      <Navbar fixed="top" bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">
          {updated ? (
            <img
              src={require('../images/logo.png')}
              width="30"
              height="30"
              alt="logo"
            />
          ) : (
            <Spinner animation="border" variant="light" />
          )}
        </Navbar.Brand>

        {Boolean(window.location.pathname !== '/') ? (
          <>
            {Boolean(adminEvents) && (
              <Nav className="mr-auto">
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
                <Nav.Link disabled href="/groups">
                  <h5>Groups</h5>
                </Nav.Link>
                <Nav.Link disabled href="/notifications">
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
            key={event.id}
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

      <EditProfileModal show={show} setShow={setShow} />
    </>
  )
}

function EditProfileModal({ show, setShow }) {
  const firstNameField = useRef(null)
  const { state, setState } = useContext(AppState)
  const [firstName, setFirstName] = useState(state.appUser.firstName)
  const [lastName, setLastName] = useState(state.appUser.lastName)
  const [profilePic, setProfilePic] = useState(state.appUserProfilePic)
  const [picChanged, setPicChanged] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (show && firstNameField) firstNameField.current.focus()
  }, [show, firstNameField])

  const clearAllFields = () => {
    setFirstName(state.appUser.firstName)
    setLastName(state.appUser.lastName)
    setProfilePic(state.appUserProfilePic)
    setShowSpinner(false)
    setPicChanged(false)
  }

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton>
        <h4>Edit Profile</h4>
      </Modal.Header>
      <Form className="m-3">
        <Form.Group>
          <Form.Label>First Name</Form.Label>
          <Form.Control
            ref={firstNameField}
            maxsize="31"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            maxsize="31"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Profile Picture</Form.Label>
          <Form.Control
            type="file"
            onChange={async e => {
              setPicChanged(true)
              // setProfilePic(e.target.files[0])
              setProfilePic(
                await resizeImage({ file: e.target.files[0], maxSize: 120 })
              )
            }}
          ></Form.Control>
          <br />
          <Image
            src={
              Boolean(profilePic)
                ? blobToUrl(profilePic)
                : require('../images/profilePlaceholder.png')
            }
            width="100"
            height="100"
            alt="profile"
            rounded
          />
        </Form.Group>
      </Form>
      <Modal.Footer>
        <Button
          onClick={() => {
            clearAllFields()
            setShow(false)
          }}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            if (!showSpinner) {
              setShowSpinner(true)
              console.log(profilePic)
              await getPHP(
                'editUser',
                {
                  emailAddr: state.appUser.emailAddr,
                  firstName: sanitize(firstName),
                  lastName: sanitize(lastName),
                  profilePicture: picChanged ? profilePic : null,
                },
                'json',
                'raw'
              )
              await getAppData(state.appUser.emailAddr, setState)
              setShow(false)
              setShowSpinner(false)
              setPicChanged(false)
            }
          }}
        >
          Save changes
          {showSpinner && <Spinner animation="border" variant="light" />}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
