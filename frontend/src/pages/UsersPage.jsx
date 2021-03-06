import React, { useState, useEffect, useContext } from 'react'
import Cookies from 'universal-cookie'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Image from 'react-bootstrap/Image'
import FormBS from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import { blobToUrl, getPHP, sanitize } from '../phpHelper'
import LoadingScreen from '../components/LoadingScreen'
import { AppUser } from '../App'
import { Formik, Form, Field } from 'formik'
import FieldWithError from '../components/FieldWithError'
import ProfilePicField from '../components/ProfilePicField'
import * as yup from 'yup'

const cookies = new Cookies()

export default function UsersPage({ isAdmin }) {
  const {
    appUser: { emailAddr },
  } = useContext(AppUser)
  const [showAdd, setShowAdd] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [appUserIsOwner, setAppUserOwner] = useState()
  const [event, setEvent] = useState()
  useEffect(() => {
    if (!emailAddr) return
    async function f() {
      const currentEventId = cookies.get('currentEventId')
      if (!currentEventId) window.location.href = '../'

      setAppUserOwner(
        await getPHP('isOwner', {
          emailAddr,
          eventId: currentEventId,
        })
      )

      const usersOnPage = await getPHP('getEventUsersByType', {
        eventId: currentEventId,
        isAdmin,
      })

      const event = await getPHP('getEventWithGroups', {
        eventId: currentEventId,
      })

      setEvent({ ...event, usersOnPage })

      setLoading(false)
    }
    f()
  }, [emailAddr, isAdmin])

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <>
      <h1 className="m-3 d-inline">{isAdmin ? 'Admin' : 'Participant'}s</h1>
      <Button
        onClick={() => setShowAdd(true)}
        variant="secondary"
        className="m-3"
      >
        Add {isAdmin ? 'Admin' : 'Participant'}
      </Button>
      <hr />
      {event.usersOnPage.map(user => (
        <UserCard
          key={user.emailAddr}
          user={user}
          event={event}
          isAdmin={isAdmin}
          appUserIsOwner={appUserIsOwner}
        />
      ))}
      <AddUserModal
        show={showAdd}
        onHide={() => setShowAdd(false)}
        eventId={event.id}
        isAdmin={isAdmin}
      />
    </>
  )
}

function AddUserModal({ show, onHide, eventId, isAdmin }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <h4>Add {isAdmin ? 'Admin' : 'Participant'}</h4>
      </Modal.Header>
      <Formik
        initialValues={{ newEmail: '' }}
        validationSchema={yup.object({ newEmail: yup.string().required() })}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true)

          await getPHP('addUserToEvent', {
            emailAddr: values.newEmail,
            isAdmin: isAdmin,
            eventId,
          })
          window.location.reload()

          setSubmitting(false)
          onHide()
        }}
      >
        {({ isSubmitting }) => (
          <Form className="m-3">
            <FieldWithError
              name="newEmail"
              placeholder="Email Address of New User"
              type="email"
            />
            <Modal.Footer>
              <Button variant="secondary" onClick={onHide}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Add User
                {isSubmitting && <Spinner animation="border" variant="light" />}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

function UserCard({ user, event, appUserIsOwner, isAdmin }) {
  const [userDetails, setUserDetails] = useState()
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [isDeleting, setDeleting] = useState(false)

  return (
    !isDeleting && (
      <>
        <Card className="mt-3">
          <Row>
            <div className="my-auto ml-4 mr-auto">
              <strong>{user.emailAddr}</strong>
              {(user.firstName || user.lastName) && <br />}
              {user.firstName && ' ' + user.firstName}
              {user.lastName && ' ' + user.lastName}
            </div>
            <div className="my-auto mr-4 ml-auto">
              <Button
                onClick={() => {
                  setShowDetails(true)
                }}
                variant="secondary"
                className="m-2"
              >
                Details
              </Button>
              {(!isAdmin || appUserIsOwner) && (
                <>
                  <Button
                    onClick={() => setShowEdit(true)}
                    variant="info"
                    className="m-2"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete user ${user.emailAddr}?`
                        )
                      ) {
                        setDeleting(true)
                        await getPHP('removeUserFromEvent', {
                          emailAddr: user.emailAddr,
                          eventId: event.id,
                        })
                        window.location.reload()
                      }
                    }}
                    variant="danger"
                    className="m-2"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </Row>
        </Card>

        <DetailsUserModal
          onHide={() => setShowDetails(false)}
          user={user}
          event={event}
          show={showDetails}
          setUserDetails={setUserDetails}
        />

        <EditUserModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          user={user}
          userDetails={userDetails}
          event={event}
          isAdmin={isAdmin}
        />
      </>
    )
  )
}

function EditUserModal({ show, onHide, user, userDetails, event, isAdmin }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <h4>Edit: {user.emailAddr}</h4>
      </Modal.Header>
      {userDetails === undefined ? (
        <LoadingScreen />
      ) : (
        <Formik
          initialValues={{
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            profilePic: userDetails.profilePic,
            groups: userDetails.groupIds.map(id => '' + id),
          }}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true)
            let groupChanged =
              values.groups.length !== userDetails.groupIds.length
            if (!groupChanged) {
              for (const group1 of values.groups) {
                if (
                  !userDetails.groupIds.find(
                    group2 => '' + group2 === '' + group1
                  )
                ) {
                  groupChanged = true
                  break
                }
              }
            }

            await getPHP(
              'editUser',
              {
                emailAddr: user.emailAddr,
                firstName: sanitize(values.firstName),
                lastName: sanitize(values.lastName),
                profilePicture:
                  values.profilePic !== userDetails.profilePic
                    ? values.profilePic
                    : null,
                groupIds: groupChanged
                  ? JSON.stringify(values.groups.map(id => +id))
                  : null,
                isAdmin,
              },
              'json',
              'raw'
            )

            window.location.reload()
            setSubmitting(false)
            onHide()
          }}
        >
          {({ values, isSubmitting }) => {
            return (
              <Form className="m-3">
                <FieldWithError name="firstName" placeholder="First Name" />
                <FieldWithError name="lastName" placeholder="Last Name" />
                <ProfilePicField
                  name="profilePic"
                  placeholder={require('../images/profilePlaceholder.png')}
                />
                {event.groups.length && (
                  <FormBS.Group>
                    <FormBS.Label>Group Memberships</FormBS.Label>
                    {event.groups.map(group => (
                      <Field
                        key={group.id}
                        name="groups"
                        type="checkbox"
                        value={'' + group.id}
                        as={FormBS.Check}
                        label={group.title}
                      />
                    ))}
                  </FormBS.Group>
                )}
                <Modal.Footer>
                  <Button variant="secondary" onClick={onHide}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Submit
                    {isSubmitting && (
                      <Spinner animation="border" variant="light" />
                    )}
                  </Button>
                </Modal.Footer>
              </Form>
            )
          }}
        </Formik>
      )}
    </Modal>
  )
}

function DetailsUserModal({ show, onHide, user, event, setUserDetails }) {
  const [isLoading, setLoading] = useState(true)
  const [profilePic, setProfilePic] = useState(null)
  const [groups, setGroups] = useState(null)

  useEffect(() => {
    if (isLoading) {
      async function f() {
        const picRequest = await getPHP(
          'getProfilePic',
          { emailAddr: user.emailAddr },
          'blob'
        )
        const groupsRequest = await getPHP('getUserEventGroups', {
          eventId: event.id,
          emailAddr: user.emailAddr,
        })
        setProfilePic(!!picRequest.size ? picRequest : false)
        setGroups(groupsRequest)
        setUserDetails({
          profilePic: !!picRequest.size ? picRequest : false,
          groupIds: groupsRequest,
        })
        setLoading(false)
      }
      f()
    }
  }, [user.emailAddr, event.id, isLoading, setUserDetails])

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <h4>{user.emailAddr}</h4>
      </Modal.Header>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="m-3">
          <p>
            <strong>Email Address: </strong>
            {user.emailAddr}
          </p>
          <p>
            <strong>First Name: </strong>
            {user.firstName || '[None]'}
          </p>
          <p>
            <strong>Last Name: </strong>
            {user.lastName || '[None]'}
          </p>
          <div>
            <p>
              <strong>Profile Picture: </strong>
            </p>
            <Image
              src={
                !!profilePic
                  ? blobToUrl(profilePic)
                  : require('../images/profilePlaceholder.png')
              }
              width="100"
              height="100"
              alt="profile"
              rounded
            />
          </div>
          <br />
          <div>
            <strong>Groups: </strong>
            {!!groups ? (
              !!groups.length ? (
                <ul>
                  {groups.map(id => {
                    if (event.groups.find(group => group.id === id))
                      return (
                        <li key={id}>
                          {event.groups.find(group => group.id === id).title}
                        </li>
                      )
                    return null
                  })}
                </ul>
              ) : (
                '[None]'
              )
            ) : (
              'Loading...'
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
