VI Mock Server
=========
Installation:

  1. Install NodeJS on your machine
  2. Checkout `svn://svn.virtual-identity.net/VI/api_mock_server/trunk` (from now on called `[ROOT]`)
  3. Create your project configuration json file [PROJECTS.JSON]
        (based on `[ROOT]/config/projects.json.TEMPLATE`) and configure your projects to match with your local setup
  4. Use your command line tool of choice to navigate to `[ROOT]/api_mock_server`
  5. Install dependencies: `npm install`
  6. Start your NodeJS server: `node server.js [PROJECTS.JSON]`.
        [PROJECTS.JSON] is the file path to your project configuration json file.
  7. Open the client in your browser: `[ROOT]/api_mock_client/index.html`

Image Generator
=========

URL for standard image: `http://127.0.0.1:1337/imageGenerator/[width]/[height]`
URL for random image: `http://127.0.0.1:1337/imageGenerator/[width]/[height]/random`
