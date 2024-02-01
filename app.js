let express = require('express')
let app = express()

let {open} = require('sqlite')
let sqlite3 = require('sqlite3')
let path = require('path')

app.use(express.json())

let database = null
let databasePath = path.join(__dirname, 'userData.db')

const initializeDbandServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('Server is running at 3000'))
  } catch (e) {
    console.log(`DB Error: ${e}`)
    process.exit(1)
  }
}
initializeDbandServer()

app.post('/register', async (request, response) => {
  let {username, name, password, gender, location} = request.body
  let hashedPass = await bcrypt.hash(password, 10)
  let checkPostUser = `SELECT * FROM user WHERE username = '${username}';`
  let dbUser = await database.get(checkPostUser)
  if (dbUser === undefined) {
    const postUser = `INSERT INTO user (username, name, password, gender, location) VALUES('${username}', '${name}', '${hashedPass}', '${gender}', '${location}');`
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const runPostUser = await database.run(postUser)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const getUser = `SELECT * FROM user WHERE username = '${username}';`
  const checkUser = await database.get(getUser)
  if (checkUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } 
  else {
    const passMatched = await bcrypt.compare(password, checkUser.password)
    if (passMatched === true) {
      response.status(200)
      response.send('Login Success!')
    } 
    else {
      response.status(400)
      response.send('Invalid Password')
    }
  }
})

module.exports = app
