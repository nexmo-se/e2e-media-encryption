const path = require('path');
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const OpenTok = require('opentok');

const port = process.env.PORT || 3002

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "./frontend/build")));


const opentok = new OpenTok(process.env.API_KEY, process.env.API_SECRET);
let rooms = [];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend/build/index.html"));
});

app.post('/rooms/:room_name', async (req, res)  => {
    const roomName = req.params.room_name;
    const role = req.body.role;
    const roomFound = rooms.find((room) => room.name === roomName);

    if (roomFound) {
      const token = opentok.generateToken(roomFound.sessionId, {role});
      res.json({
        apiKey: process.env.API_KEY,
        sessionId: roomFound.sessionId,
        token
      }).end()
    }
    else{
      const room = await createSession(roomName);
      const token = opentok.generateToken(room.sessionId, {role});
      res.json({
        apiKey: process.env.API_KEY,
        sessionId: room.sessionId,
        token
      }).end()
    }
})

function createSession(roomName) {
    // Generate Session
    return new Promise((resolve, reject) => {
        opentok.createSession({
          mediaMode: 'routed',
          e2ee: 'true',
        }, function(error, session) {
        if (error) {
          console.log('Error creating session:', error)
          reject();
        } else {
          let room = {
            name: roomName,
            sessionId: session.sessionId
          }
          rooms.push(room)  
          resolve(room)
        }
      });
  })
}

app.listen(port, () => console.log(`Listening to port ${port}`));
