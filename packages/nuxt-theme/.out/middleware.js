const middleware = {}

middleware['dashboardAccess'] = require('../middleware/dashboardAccess.js')
middleware['dashboardAccess'] = middleware['dashboardAccess'].default || middleware['dashboardAccess']

middleware['isAuthenticated'] = require('../middleware/isAuthenticated.js')
middleware['isAuthenticated'] = middleware['isAuthenticated'].default || middleware['isAuthenticated']

middleware['isSetup'] = require('../middleware/isSetup.js')
middleware['isSetup'] = middleware['isSetup'].default || middleware['isSetup']

middleware['siteSettings'] = require('../middleware/siteSettings.js')
middleware['siteSettings'] = middleware['siteSettings'].default || middleware['siteSettings']

export default middleware
