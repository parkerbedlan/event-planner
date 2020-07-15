import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  Button,
  Card,
  Row,
  Modal,
  Form as FormBS,
  Spinner,
  Alert,
} from 'react-bootstrap'
import { AppUser } from '../App'
import Cookies from 'universal-cookie'
import { getPHP } from '../phpHelper'
import { LoadingScreen } from '../components/LoadingScreen'
import { FieldWithError } from '../components/FieldWithError'
import { Formik, Form, Field } from 'formik'
import * as yup from 'yup'

const cookies = new Cookies()

const Styles = styled.div`
  .mt {
    margin-top: 1em;
  }
`

export default function GroupsPage() {
  const {
    appUser: { emailAddr },
  } = useContext(AppUser)
  const [isLoading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [users, setUsers] = useState()
  const [groups, setGroups] = useState()
  const [eventId, setEventId] = useState()
  useEffect(() => {
    if (!emailAddr) return
    async function f() {
      const currentEventId = cookies.get('currentEventId')
      if (!currentEventId) window.location.href = '../'
      setEventId(currentEventId)

      const usersReq = await getPHP('getEventUsers', {
        eventId: currentEventId,
      })
      const groupsReq = await getPHP('getEventGroups', {
        eventId: currentEventId,
      })
      const groupsWithUsers = await Promise.all(
        groupsReq.map(async group => ({
          ...group,
          emails: await getPHP('getGroupEmails', { groupId: group.id }),
        }))
      )

      setUsers(usersReq)
      setGroups(groupsWithUsers)
      setLoading(false)
    }
    f()
  }, [emailAddr])
  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Styles>
      <h1 className="m-3 d-inline">Groups</h1>
      <Button
        onClick={() => setShowNew(true)}
        variant="secondary"
        className="m-3"
      >
        Add New Group
      </Button>
      {groups.map(group => (
        <GroupCard group={group} users={users} key={group.id} />
      ))}
      <pre>{JSON.stringify(users, null, 2)}</pre>
      <pre>{JSON.stringify(groups, null, 2)}</pre>
      <EditGroupModal
        newGroup
        eventId={eventId}
        show={showNew}
        onHide={() => setShowNew(false)}
        users={users}
      />
    </Styles>
  )
}

function GroupCard({ group, users }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)
  return (
    !deleting && (
      <>
        <Card className="mt">
          <Row>
            <div className="my-auto ml-4 mr-auto">
              <strong>{group.title}</strong>
            </div>
            <div className="my-auto mr-4 ml-auto">
              <Button
                onClick={() => setShowDetails(true)}
                variant="secondary"
                className="m-2"
              >
                Details
              </Button>
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
                      `Are you sure you want to delete group ${group.title}?`
                    )
                  ) {
                    await getPHP('removeGroup', { groupId: group.id })
                    setDeleting(true)
                    window.location.reload()
                  }
                }}
                variant="danger"
                className="m-2"
              >
                Delete
              </Button>
            </div>
          </Row>
        </Card>
        <DetailsGroupModal
          show={showDetails}
          onHide={() => setShowDetails(false)}
          users={users}
          group={group}
        />
        <EditGroupModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          users={users}
          group={group}
        />
      </>
    )
  )
}

function EditGroupModal({ group, users, show, onHide, newGroup, eventId }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <h4>{newGroup ? 'Create New Group' : `Edit Group: ${group.title}`}</h4>
      </Modal.Header>
      <Formik
        initialValues={
          newGroup
            ? { title: '', emails: [] }
            : { title: group.title, emails: group.emails }
        }
        validationSchema={yup.object({
          title: yup.string().required(),
          emails: yup.array().required(),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true)
          if (newGroup) {
            await getPHP('addGroup', {
              eventId,
              title: values.title,
              users: values.emails.map(email => ({
                emailAddr: email,
                isAdmin: users.find(user => user.emailAddr === email).isAdmin
                  ? 1
                  : 0,
              })),
            })
          } else {
            await getPHP('editGroup', {
              groupId: group.id,
              title: values.title,
              users: values.emails.map(email => ({
                emailAddr: email,
                isAdmin: users.find(user => user.emailAddr === email).isAdmin
                  ? 1
                  : 0,
              })),
            })
          }
          window.location.reload()
          setSubmitting(false)
          onHide()
        }}
      >
        {({ isSubmitting, errors }) => {
          return (
            <Form className="m-3">
              <FieldWithError name="title" placeholder="Group Title" />
              <FormBS.Group>
                <FormBS.Label>
                  <strong>Users:</strong>
                </FormBS.Label>
                {users.map(user => (
                  <Field
                    name="emails"
                    value={user.emailAddr}
                    label={
                      <>
                        {user.emailAddr}
                        {!!(user.firstName || user.lastName) &&
                          ' (' +
                            (user.firstName || '') +
                            (user.lastName ? ' ' + user.lastName : '') +
                            ')'}
                      </>
                    }
                    type="checkbox"
                    as={FormBS.Check}
                    key={user.emailAddr}
                  />
                ))}
                {errors.emails && (
                  <Alert variant="danger">{errors.emails}</Alert>
                )}
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

function DetailsGroupModal({ group, users, show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <h4>{group.title}</h4>
      </Modal.Header>
      <div className="m-3">
        <p>
          <strong>Title: </strong>
          {group.title}
        </p>
        <div>
          <strong>Members: </strong>
          <ul>
            {group.emails.map(email => {
              const user = users.find(u => u.emailAddr === email)
              return (
                <li>
                  {user.emailAddr}
                  {!!(user.firstName || user.lastName) &&
                    ' (' +
                      (user.firstName || '') +
                      (user.lastName ? ' ' + user.lastName : '') +
                      ')'}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
