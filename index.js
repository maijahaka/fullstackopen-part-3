require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

var morgan = require('morgan')
morgan.token('body', function (req) { return JSON.stringify(req.body) })

app.use(express.json())
app.use(morgan(
    ':method :url :status :res[content-length] - :response-time ms :body', {
        skip: function (req) { return req.method !== 'POST'}
    }))
app.use(morgan(
    'tiny', {
        skip: function (req) { return req.method === 'POST' }
    }
))

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
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

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(res => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
    const date = new Date()

    Person.count()
        .then(result => {
            res.send(`<p>Phonebook has info for ${result} people</p>`
                + `<p>${date}</p>`)
        })
        .catch(error => next(error))

})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).send({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})