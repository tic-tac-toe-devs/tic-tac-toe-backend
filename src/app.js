import express from 'express'
import { Dynamo } from './dynamo.js'
import { GAME_STATE, HEARTBEAT_INTERVAL, JOIN_ROOM, MOVE_PLAYED } from './constants.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { mockGameStateEventArgs } from './gameProtocol.js'

const port = process.env.PORT || 8086

const app = express()
app.use(express.json())
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
})

const dynamo = new Dynamo()

setInterval(async () => await dynamo.deleteStaleUsers(), HEARTBEAT_INTERVAL)

io.of('/game').on('connection', (socket) => {
  console.log(`Connected with client ${socket.id}`)
  socket.on(JOIN_ROOM, (roomId) => {
    socket.join(roomId)
    console.log(`Client ${socket.id} is joined to room ${roomId}!`)
    io.of('/game').to(roomId).emit(GAME_STATE, mockGameStateEventArgs)
  })
  socket.on(MOVE_PLAYED, (movePlayedEventArgs) => {
    //TODO: a method for updating game_state data
    io.of('/game').to(mockGameStateEventArgs.id).emit(GAME_STATE, mockGameStateEventArgs)
  })
})

app.post('/heartbeat', async (req, res) => {
  try {
    const { id, username } = req.body

    if (!id && typeof id !== 'string') return res.status(400).send({ message: "Field 'id' is required, and must be a string" })

    if (!username && typeof username !== 'string') return res.status(400).send({ message: "Field 'username' is required, and must be a string" })

    await dynamo.addUserToOnlineList(id, username)
    return res.status(200).send()
  } catch (e) {
    console.error('Error while sending heartbeat 😬', e)
    res.status(500).send({ message: e.message })
  }
})

app.get('/online-users', async (req, res) => {
  try {
    const onlineUsers = await dynamo.getOnlineUsers()
    res.send(onlineUsers)
  } catch (e) {
    console.error('Error while getting online users 😬', e)
    res.status(500).send({ message: e.message })
  }
})

app.post('/game', async (req, res) => {
  try {
    const { players } = req.body

    if (!players || !Array.isArray(players) || players.length !== 2 || players.includes(''))
      return res.status(400).send({ message: "Field 'players' is not correct!" })

    await dynamo.createGame(players)
    res.status(200).send()
  } catch (e) {
    console.error('Error while creating game 😬', e)
    res.status(500).send({ message: e.message })
  }
})

app.get('/my-started-game', async (req, res) => {
  try {
    const { playerId } = req.query

    if (!playerId) return res.status(400).send({ message: 'Field playerId is required!' })

    const startedGames = await dynamo.getStartedGames(playerId)

    if (!startedGames) return res.status(404).send({ message: 'Not found started games 😬' })

    const gamesId = startedGames.map(({ id: gameId }) => {
      return { gameId }
    })
    res.send(gamesId)
  } catch (e) {
    console.error('Error while getting started games 😬', e)
    res.status(500).send({ message: e.message })
  }
})

httpServer.listen(port)
console.log(`Tic-Tac-Toe backend started and listening on port ${port} 👈🥸`)
