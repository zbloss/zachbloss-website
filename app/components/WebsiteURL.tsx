const WebsiteURL = process.env.NODE_ENV === 'production'
    ? 'https://zachbloss.com'
    : 'http://localhost:3000'

export default WebsiteURL