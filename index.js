const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

var morgan = require('morgan')
morgan.token('body', function (req,res) { return JSON.stringify(req.body) })

app.use(express.json())
app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms :body', {
        skip: function (req, res) { return req.method !== 'POST'}
    }))
app.use(morgan(
    'tiny', {
        skip: function (req, res) { return req.method === 'POST' }
}))

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.post('/api/persons', (req, res) => {
    const getRandomInt = (max) => (
        Math.floor(Math.random() * Math.floor(max))
    )

    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return res.status(400).json({
            error: 'number missing'
        })
    }

    if (persons.find(p => p.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unigue'
        })
    }

    const person = req.body
    person.id = getRandomInt(10000)

    persons = persons.concat(person)

    res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    console.log(persons)

    res.status(204).end()
})

app.get('/info', (req, res) => {
    const date = new Date()

    res.send(`<p>Phonebook has info for ${persons.length} people</p>`
        + `<p>${date}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})