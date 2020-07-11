import React, { useState, useEffect, useContext } from 'react'
import Cookies from 'universal-cookie'
import styled from 'styled-components'
import { Card, Row, Button, Modal, Image } from 'react-bootstrap'
import { blobToUrl, getPHP } from '../phpHelper'
import { LoadingScreen } from '../components/LoadingScreen'
import { AppUser } from '../App'

const cookies = new Cookies()

const Styles = styled.div`
  .mt {
    margin-top: 1em;
  }
`

export default function AdminsPage() {
  const {
    appUser: { emailAddr },
  } = useContext(AppUser)
  const [isLoading, setLoading] = useState(true)
  const [isOwner, setOwner] = useState()
  const [event, setEvent] = useState()

  useEffect(() => {
    if (!emailAddr) return
    async function f() {
      const currentEventId = cookies.get('currentEventId')
      if (!currentEventId) window.location.href = '../'

      setOwner(
        await getPHP('isOwner', {
          emailAddr,
          eventId: currentEventId,
        })
      )

      const admins = await getPHP('getAdmins', { eventId: currentEventId })

      const event = await getPHP('getEventGroups', { eventId: currentEventId })

      setEvent({ ...event, admins })

      await setLoading(false)
    }
    f()
  }, [emailAddr])

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Styles>
      <h1 className="m-3 d-inline">Admins</h1>
      <Button disabled onClick={() => {}} variant="secondary" className="m-3">
        Add Admin
      </Button>
      <hr />
      {event.admins.map(admin => (
        <UserCard
          key={admin.emailAddr}
          user={admin}
          event={event}
          isAdmin={true}
          isOwner={isOwner}
        />
      ))}
    </Styles>
  )
}

function UserCard({ user, event, isOwner }) {
  const [userDetails, setUserDetails] = useState()
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.log(userDetails)
  }, [userDetails])

  return (
    <>
      <Card className="mt">
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
            {isOwner && (
              <>
                <Button disabled variant="info" className="m-2">
                  Edit
                </Button>
                <Button disabled variant="danger" className="m-2">
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
    </>
  )
}

function DetailsUserModal({ show, onHide, user, event, setUserDetails }) {
  const [isLoading, setLoading] = useState(true)
  const [profilePic, setProfilePic] = useState(null)
  const [groups, setGroups] = useState(null)

  useEffect(() => {
    if (isLoading) {
      console.log(user.emailAddr)
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
                    if (Object.keys(event.groups).includes(String(id)))
                      return <li key={id}>{event.groups[id].title}</li>
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
