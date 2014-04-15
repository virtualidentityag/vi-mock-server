VI Mock Server
=========
Installation:

  1. Install NodeJS on your machine
  2. Clone the repository: `git clone https://github.com/virtualidentityag/vi-mock-server.git` 
  3. Create your project configuration json file `projects.json` (based on `[ROOT]/config/projects.json.TEMPLATE`) and configure your projects to match with your local setup
  4. Use your command line tool of choice to navigate to `[ROOT]`
  5. Install dependencies: `npm install`
  6. Start your NodeJS server: `node server.js ./path/to/projects.json`.

Image Generator
=========

URL for standard image: `http://127.0.0.1:1337/imageGenerator/[width]/[height]`
URL for random image: `http://127.0.0.1:1337/imageGenerator/[width]/[height]/random`
