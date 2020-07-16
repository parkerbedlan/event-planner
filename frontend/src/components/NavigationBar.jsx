import React, { useContext, useState, useEffect } from 'react'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Image from 'react-bootstrap/Image'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import FormBS from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import { blobToUrl, getPHP, sanitize } from '../phpHelper'
import { Auth0Context } from '../contexts/auth0-context'
import Cookies from 'universal-cookie'
import { AppUser } from '../App'
import { Formik, Form } from 'formik'
import FieldWithError from '../components/FieldWithError'
import ProfilePicField from '../components/ProfilePicField'

const cookies = new Cookies()

export default function NavigationBar() {
  const { appUser, setAppUser } = useContext(AppUser)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading && appUser.emailAddr) {
      async function f() {
        const profilePic = await getPHP(
          'getProfilePic',
          { emailAddr: appUser.emailAddr },
          'blob'
        )
        const adminEvents = await getPHP('getAdminEventTitles', {
          emailAddr: appUser.emailAddr,
        })
        const { firstName, lastName } = await getPHP('getUserData', {
          emailAddr: appUser.emailAddr,
        })
        setAppUser({ ...appUser, profilePic, adminEvents, firstName, lastName })
        setLoading(false)
      }
      f()
    }
  }, [isLoading, appUser, setAppUser])

  return (
    <>
      <Navbar fixed="top" bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">
          {!isLoading ? (
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

        {!isLoading &&
          (window.location.pathname !== '/' ? (
            <>
              {!!appUser.adminEvents && (
                <Nav className="mr-auto">
                  <EventDropdown adminEvents={appUser.adminEvents} />
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
                  <Nav.Link href="/groups">
                    <h5>Groups</h5>
                  </Nav.Link>
                  <OverlayTrigger
                    placement="bottom-start"
                    delay={{ show: 100, hide: 400 }}
                    overlay={<Tooltip>Coming Soon!</Tooltip>}
                  >
                    <Nav.Link style={{ color: 'rgba(255, 255, 255, 0.25)' }}>
                      <h5>Notifications</h5>
                    </Nav.Link>
                  </OverlayTrigger>
                  <ProfileDropdown appUser={appUser} />
                </Nav>
              </Navbar.Collapse>
            </>
          ) : (
            <Nav className="ml-auto">
              <ProfileDropdown appUser={appUser} className="ml-auto" />
            </Nav>
          ))}
      </Navbar>
      <div style={{ marginTop: '6em' }} />
    </>
  )
}

function EventDropdown({ adminEvents }) {
  return (
    <NavDropdown
      title={
        adminEvents.find(event => event.id === cookies.get('currentEventId'))
          .shortTitle
      }
    >
      {adminEvents.map(event => {
        return (
          <NavDropdown.Item
            key={event.id}
            onClick={() => {
              cookies.set('currentEventId', event.id)
              window.location.reload()
            }}
          >
            {event.id === cookies.get('currentEventId') ? (
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

function ProfileDropdown({ appUser }) {
  const { logout } = useContext(Auth0Context)
  const [show, setShow] = useState(false)
  return (
    <>
      <NavDropdown
        title={
          <Image
            src={
              !!appUser.profilePic
                ? blobToUrl(appUser.profilePic)
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

      <EditProfileModal
        show={show}
        onHide={() => setShow(false)}
        appUser={appUser}
      />
    </>
  )
}

function EditProfileModal({ show, onHide, appUser }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" background="static">
      <Modal.Header closeButton>
        <h4>Edit profile: {appUser.emailAddr}</h4>
      </Modal.Header>
      <Formik
        initialValues={{
          firstName: appUser.firstName,
          lastName: appUser.lastName,
          profilePic: appUser.profilePic,
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true)
          await getPHP(
            'editUser',
            {
              emailAddr: appUser.emailAddr,
              firstName: sanitize(values.firstName),
              lastName: sanitize(values.lastName),
              profilePicture:
                values.profilePic !== appUser.profilePic
                  ? values.profilePic
                  : null,
            },
            'json',
            'raw'
          )
          window.location.reload()
          setSubmitting(false)
          onHide()
        }}
      >
        {({ isSubmitting }) => {
          return (
            <Form className="m-3">
              <FieldWithError name="firstName" placeholder="First Name" />
              <FieldWithError name="lastName" placeholder="Last Name" />
              <FormBS.Group>
                <FormBS.Label>
                  <strong>Profile Picture:</strong>
                </FormBS.Label>
                <ProfilePicField
                  name="profilePic"
                  placeholder={require('../images/profilePlaceholder.png')}
                />
              </FormBS.Group>
              <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Save changes
                  {isSubmitting && (
                    <Spinner animation="border" variant="light" />
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )
        }}
      </Formik>
    </Modal>
  )
}
