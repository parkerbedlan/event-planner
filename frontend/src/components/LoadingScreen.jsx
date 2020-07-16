import React from 'react'

const LoadingScreen = () => (
  <div
    style={{
      width: '100%',
      height: '100vh',
      background: `url(${require('../images/loading.gif')}) center center no-repeat`,
    }}
  />
)

export default LoadingScreen
