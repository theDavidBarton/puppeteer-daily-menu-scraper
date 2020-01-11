/*
 * copyright 2019, David Barton (theDavidBarton)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const express = require('express')
const mongoDbSearch = require('./../lib/mongoDbSearch')

function endpointCreation() {
  try {
    const app = express()
    const port = process.env.PORT || 5000

    // providing a dynamic endpoint for status code descriptions
    app.get('/api/1/daily-menu/:date', async (req, res) => {
      try {
        const date = req.params.date
        const results = await mongoDbSearch(date)
        results[0] ? res.json(results) : res.status(404).json({ error: 'no menu for the selected date!' })
        console.log(`/api/1/daily-menu/${date} endpoint has been called!`)
      } catch (e) {
        console.error(e)
      }
    })

    app.listen(port)

    console.log(`API is listening on ${port}`)
  } catch (e) {
    console.error(e)
  }
}
endpointCreation()
