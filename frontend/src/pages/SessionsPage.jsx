import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import {
  Button,
  Modal,
  Spinner,
  Form as FormBS,
  Card,
  Col,
  Row,
  Alert,
} from 'react-bootstrap'
import { Formik, Field, Form } from 'formik'
import Cookies from 'universal-cookie'
import { getAppData } from '../App'
import { getPHP, sanitize } from '../phpHelper'
import { FieldWithError } from '../components/FieldWithError'

const cookies = new Cookies()

const Styles = styled.div`
  * {
    margin-top: 1em;
  }
`

export default function SessionsPage({ appUser }) {
  const currentEventId = cookies.get('currentEventId')
  if (!currentEventId) window.location.href = '../'
  const event = appUser.adminEvents[currentEventId]

  const [showNew, setShowNew] = useState(false)
  const [showPrevSessions, setShowPrevSessions] = useState(false)

  let date = useRef('')
  let month = useRef('')

  return (
    <Styles>
      {showNew && (
        <NewSessionModal
          onHide={() => setShowNew(false)}
          event={event}
          appUserEmail={appUser.emailAddr}
        />
      )}

      <h1 className="m-3" style={{ display: 'inline' }}>
        Sessions
      </h1>
      <Button
        onClick={() => setShowNew(true)}
        variant="secondary"
        className="m-3"
      >
        Create New Session
      </Button>
      <FormBS.Switch
        id="prevSwitch"
        checked={showPrevSessions}
        onChange={e => setShowPrevSessions(e.target.checked)}
        label="Show Previous Sessions"
      />

      {event.sessions.map(session => {
        const showSession =
          showPrevSessions || new Date(session.startTime) >= new Date()

        let monthHeader = getMonth(session.startTime)
        if (month === monthHeader || !showSession) monthHeader = ''
        else month = monthHeader

        let dateHeader = getDate(session.startTime)
        if (date === dateHeader || !showSession) dateHeader = ''
        else date = dateHeader

        return (
          <React.Fragment key={session.id}>
            {Boolean(showSession) && (
              <>
                {Boolean(monthHeader) && (
                  <>
                    <h1>{monthHeader}</h1>
                    <hr />
                  </>
                )}
                {Boolean(dateHeader) && <h2>{dateHeader}</h2>}

                <SessionCard session={session} event={event} />
              </>
            )}
          </React.Fragment>
        )
      })}
    </Styles>
  )
}

function SessionCard({ session, event }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      {!deleting && (
        <Card>
          <Row className="m-0">
            <Col>
              <strong>{session.title}</strong>
              <br />
              {session.startTime.substring(11, 16) +
                ' - ' +
                session.endTime.substring(11, 16)}
            </Col>
            <Col>
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
                      `Are you sure you want to delete ${session.title}?`
                    )
                  ) {
                    setDeleting(true)
                    await getPHP('removeSession', {
                      sessionId: session.id,
                    })
                    await getAppData()
                  }
                }}
                variant="danger"
                className="m-2"
              >
                Delete
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {showDetails && (
        <DetailsSessionModal
          session={session}
          event={event}
          onHide={() => setShowDetails(false)}
        />
      )}

      {showEdit && (
        <EditSessionModal
          session={session}
          event={event}
          onHide={() => setShowEdit(false)}
        />
      )}
    </>
  )
}

function DetailsSessionModal({ onHide, session, event }) {
  return (
    <Modal show={true} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <h4>{session.title}</h4>
      </Modal.Header>
      <div className="m-3">
        <p>
          <strong>Title: </strong>
          {session.title}
        </p>
        <p>
          <strong>Description: </strong>
          {session.description || 'None'}
        </p>
        <p>
          <strong>Start Time: </strong>
          {getString(session.startTime)}
        </p>
        <p>
          <strong>End Time: </strong>
          {getString(session.endTime)}
        </p>
        <p>
          <strong>Link: </strong>
          {session.link || 'None'}
        </p>
        <p>
          <strong>Location: </strong>
          {session.location || 'None'}
        </p>
        <p>
          <strong>Attendees: </strong>
          {session.everyone
            ? 'Everyone'
            : session.groupIds.map(id => event.groups[id].title).join(', ')}
        </p>
        <p>
          <strong>Number of Attendees: </strong>
          {session.everyone
            ? Object.keys(event.admins).length +
              Object.keys(event.participants).length
            : session.groupIds.reduce(
                (a, b) =>
                  a +
                  event.groups[b].leaderEmails.length +
                  event.groups[b].memberEmails.length,
                0
              )}
        </p>
      </div>
    </Modal>
  )
}

function EditSessionModal({ onHide, session, event }) {
  return (
    <Modal show={true} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <h4>Edit: {session.title}</h4>
      </Modal.Header>
      <Formik
        validateOnChange={true}
        initialValues={{
          title: session.title,
          description: session.description,
          startDate: session.startTime.substring(0, 10),
          startTime: session.startTime.substring(11, 16),
          endDate: session.endTime.substring(0, 10),
          endTime: session.endTime.substring(11, 16),
          everyone: session.everyone,
          groups: session.groupIds.map(id => String(id)),
          link: session.link,
          location: session.location,
        }}
        validate={values => {
          const errors = {}

          if (!values.title.trim().length) errors.title = 'Title required.'
          if (
            !values.startDate ||
            !values.startTime ||
            !values.endDate ||
            !values.endTime
          )
            errors.time = 'All time fields required.'
          if (
            new Date(`${values.startDate} ${values.startTime}`) -
              new Date(`${values.endDate} ${values.endTime}`) >
            0
          )
            errors.time =
              "Your session's End Time needs to come after your Start Time."
          if (!values.everyone && !values.groups.length)
            errors.groups = 'Check who you want to attend the event.'

          return errors
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true)
          await getPHP('editSession', {
            // eventId: event.id,
            sessionId: session.id,
            title: sanitize(values.title),
            description: sanitize(values.description),
            startTime: `${values.startDate} ${values.startTime}`,
            endTime: `${values.endDate} ${values.endTime}`,
            link: sanitize(values.link),
            location: sanitize(values.location),
            groups: values.groups.map(id => Number(id)),
            // eslint-disable-next-line
            everyone: values.everyone == 'true',
          })
          await getAppData()
          setSubmitting(false)
          onHide()
        }}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => {
          return (
            <Form className="m-3">
              <h2>What</h2>
              <FieldWithError name="title" placeholder="Title" />
              <FieldWithError
                name="description"
                placeholder="Description (optional)"
                as="textarea"
              />

              <h2>When</h2>
              <FormBS.Group>
                <strong>Start Time: </strong>
                <Field
                  name="startDate"
                  type="date"
                  style={{ width: '15rem' }}
                  className="form-control d-inline"
                />
                <Field
                  name="startTime"
                  type="time"
                  style={{ width: '15rem' }}
                  className="form-control d-inline"
                />
              </FormBS.Group>
              <FormBS.Group>
                <strong>End Time: </strong>
                <Field
                  name="endDate"
                  type="date"
                  style={{ width: '15rem' }}
                  className="form-control d-inline"
                />
                <Field
                  name="endTime"
                  type="time"
                  style={{ width: '15rem' }}
                  className="form-control d-inline"
                />
              </FormBS.Group>
              {errors.time && <Alert variant="danger">{errors.time}</Alert>}

              {hasGroup(event) && (
                <FormBS.Group>
                  <h2>Who</h2>
                  <Field
                    name="everyone"
                    value="true"
                    type="radio"
                    as={FormBS.Check}
                    label={<strong>Everyone</strong>}
                    checked={values.everyone === 'true'}
                  />
                  <Field
                    name="everyone"
                    value="false"
                    type="radio"
                    as={FormBS.Check}
                    label={<strong>Specific Groups...</strong>}
                    checked={values.everyone !== 'true'}
                  />
                  {values.everyone !== 'true' && (
                    <>
                      <FormBS.Check
                        label="Check All Groups"
                        onChange={e => {
                          setFieldValue(
                            'groups',
                            e.target.checked ? Object.keys(event.groups) : []
                          )
                        }}
                      />
                      {Object.values(event.groups).map(group => {
                        return (
                          <Field
                            key={group.id}
                            name="groups"
                            type="checkbox"
                            value={group.id}
                            label={group.title}
                            as={FormBS.Check}
                            checked={values.groups.includes(String(group.id))}
                          />
                        )
                      })}
                    </>
                  )}
                  {errors.groups && touched.groups && (
                    <Alert variant="danger">{errors.groups}</Alert>
                  )}
                </FormBS.Group>
              )}

              <h2>Where</h2>
              <FieldWithError
                name="link"
                placeholder="Invite Link (optional)"
              />
              <FieldWithError
                name="location"
                placeholder="Physical Location (optional)"
              />

              <Modal.Footer>
                <Button onClick={onHide} variant="secondary">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  Save changes{' '}
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

function NewSessionModal({ onHide, event, appUserEmail }) {
  const titleField = useRef(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [everyone, setEveryone] = useState(true)
  const [groups, setGroups] = useState([])
  const [link, setLink] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    if (titleField) titleField.current.focus()
  }, [titleField])

  return (
    <Modal show={true} onHide={onHide} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <h4>Create New Session</h4>
      </Modal.Header>
      <FormBS className="m-3">
        <FormBS.Group>
          <h2>What</h2>
          <FormBS.Control
            ref={titleField}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Session Title"
          />
        </FormBS.Group>
        <FormBS.Group>
          <FormBS.Control
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            as="textarea"
          />
        </FormBS.Group>
        <FormBS.Group>
          <h2>When</h2>
          <FormBS.Label className="mr-2">Start Time</FormBS.Label>
          <FormBS.Control
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value)
              setEndDate(e.target.value)
            }}
            style={{ display: 'inline', width: '15rem' }}
          />
          <FormBS.Control
            type="time"
            value={startTime}
            onChange={e => {
              setStartTime(e.target.value)
              const [hr, min] = e.target.value.split(':')
              setEndTime(((Number(hr) + 1) % 24) + ':' + min)
            }}
            style={{ display: 'inline', width: '15rem' }}
          />
        </FormBS.Group>
        <FormBS.Group>
          <FormBS.Label className="mr-2">End Time</FormBS.Label>
          <FormBS.Control
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ display: 'inline', width: '15rem' }}
          />
          <FormBS.Control
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            style={{ display: 'inline', width: '15rem' }}
          />
        </FormBS.Group>
        {hasGroup(event) && (
          <FormBS.Group>
            <h2>Who</h2>
            <FormBS.Check
              checked={everyone}
              onChange={() => setEveryone(true)}
              name="everyoneRadio"
              label={<strong>Everyone</strong>}
              type="radio"
            />
            <FormBS.Check
              checked={!everyone}
              onChange={() => setEveryone(false)}
              name="everyoneRadio"
              label={<strong>Specific Groups...</strong>}
              type="radio"
            />
            {!everyone && (
              <>
                <FormBS.Check
                  onChange={e => {
                    if (e.target.checked)
                      setGroups(Object.keys(event.groups).map(id => Number(id)))
                    else setGroups([])
                  }}
                  label="Check All Groups"
                  type="checkbox"
                />
                {Object.values(event.groups).map(group => (
                  <FormBS.Check
                    checked={groups.includes(group.id)}
                    onChange={e => {
                      if (e.target.checked) setGroups([...groups, group.id])
                      else setGroups(groups.filter(g => g !== group.id))
                    }}
                    key={group.id}
                    label={group.title}
                    type="checkbox"
                  />
                ))}
              </>
            )}
          </FormBS.Group>
        )}
        <FormBS.Group>
          <h2>Where</h2>
          <FormBS.Control
            value={link}
            onChange={e => setLink(e.target.value)}
            type="url"
            placeholder="Invite Link (optional)"
          />
        </FormBS.Group>
        <FormBS.Group>
          <FormBS.Control
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Physical Location (optional)"
          />
        </FormBS.Group>
      </FormBS>
      <Modal.Footer>
        <Button onClick={onHide} variant="secondary">
          Cancel
        </Button>
        <Button
          onClick={async () => {
            if (!title.trim().length) {
              alert('Your session needs a title!')
            } else if (!startDate || !startTime || !endDate || !endTime) {
              alert('Your session needs a time!')
            } else if (
              new Date(`${startDate} ${startTime}`) -
                new Date(`${endDate} ${endTime}`) >
              0
            ) {
              alert(
                "Your session's End Time needs to come after your Start Time!"
              )
            } else if (!everyone && !groups.length) {
              alert('Check who you want to attend the event!')
            } else if (!showSpinner) {
              setShowSpinner(true)
              await getPHP('addSession', {
                eventId: event.id,
                title: sanitize(title),
                description: sanitize(description),
                startTime: `${startDate} ${startTime}`,
                endTime: `${endDate} ${endTime}`,
                link: sanitize(link),
                location: sanitize(location),
                groups: groups,
                everyone,
              })
              await getAppData()
              onHide()
            }
          }}
        >
          Create Session
          {showSpinner && <Spinner animation="border" variant="light" />}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const hasGroup = event => {
  for (const key in event.groups) return true
  return false
}

const getMonth = timestamp =>
  new Date(timestamp).toLocaleDateString('en', {
    year: 'numeric',
    month: 'long',
  })

const getDate = timestamp =>
  new Date(timestamp).toDateString().substring(0, 10).replace(' 0', ' ')

const getString = timestamp => new Date(timestamp).toLocaleString()
