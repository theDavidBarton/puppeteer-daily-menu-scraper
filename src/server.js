/*
 * ___________
 * MIT License
 *
 * Copyright (c) 2020 David Barton
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict'

const express = require('express')
const cors = require('cors')
const { mongoDbSearch } = require('./../lib/mongoDbSearch')

!(() => {
  try {
    const app = express()
    app.use(cors())
    const port = process.env.PORT || 5000

    app.get('/api/1/daily-menu/', async (req, res) => {
      try {
        const results = await mongoDbSearch()
        results[0] ? res.json(results) : res.status(500).json({ error: 'something must be wrong on our side, come back later!' })
        console.log('/api/1/daily-menu/ endpoint has been called!')
      } catch (e) {
        console.error(e)
      }
    })

    app.get('/api/1/daily-menu/:date', async (req, res) => {
      try {
        const date = req.params.date.match(/[1-2][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/) ? req.params.date : null
        const results = await mongoDbSearch(date)
        results[0] ? res.json(results) : res.status(404).json({ error: 'no menu for the selected date!' })
        console.log(`/api/1/daily-menu/${date} endpoint has been called!`)
      } catch (e) {
        console.error(e)
      }
    })
    app.listen(port)

    console.log(`API is listening on ${port}\nendpoint is available at: /api/1/daily-menu/`)
  } catch (e) {
    console.error(e)
  }
})()
