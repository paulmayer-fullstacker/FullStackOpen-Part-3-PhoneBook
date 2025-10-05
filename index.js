// Exercises 3.1.-3.8.
// index.js:
require('dotenv').config()  // Ensure this is first line
const express = require('express')
const morgan = require('morgan') // Require morgan
const app = express()
const cors = require('cors')
// URL = http://localhost:3001/api/persons
app.use(cors())
app.use(express.json()) // express.json() middleware must be called BEFORE morgan, to ensure that `req.body` is parsed and available to the morgan token.
// app.use(morgan('tiny')) // Use morgan middleware with the 'tiny' format string. This will log minimal information to the console for every request.

// Define a custom 'postBody' token for morgan that extracts and stringifies the request body (request.body).
morgan.token('post-Body', (request, response) => {
    // Only show the body for POST requests that have a body
    if (request.method === 'POST' && request.body) {
        return JSON.stringify(request.body)
    }
    return '-'; // Return a hyphen for other requests or no body
});

// 2. Use a custom format string that includes the postBody token.
const customLogFormat = ':method :url :status :res[content-length] - :response-time ms :post-Body';
app.use(morgan(customLogFormat))
app.use(express.static('dist'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// Random generateId FUNCTION
const generateId = () => {
    // Generate random integer ID in a large range. Example: between 4 (to account for existing IDs) and 1,000,000,000.
    const min = 5;
    const max = 1000000000;
    let randomId;
    let idExists;
    // Do...while loop guarantees the body runs at least once and continues looping until a unique ID is found.
    do {
        // Math.random() generates a float between 0 (inclusive) and 1 (exclusive). Generate a random integer ID within the [min, max] range.
        randomId = Math.floor(Math.random() * (max - min + 1)) + min;
        // Convert randomId to STRING for the comparison, to correctly match the string IDs in the persons array.
        const randomIdString = String(randomId);
        // Check if an existing person has this new ID. Use Number(p.id) for a proper number comparison
        idExists = persons.find(p => Number(p.id) === randomId);
    } while (idExists); // Continue looping as long as idExists is truthy (meaning a person was found)
    // When loop exits, randomId is guaranteed to be unique.
    return String(randomId); 
}

// const generateId = () => {
//   const maxId = persons.length > 0
//     ? Math.max(...persons.map(n => Number(n.id)))
//     : 0
//   return String(maxId + 1)
// }

app.get('/', (request, response) => {
  response.send('<h1>PhoneBook App</h1>')
})

app.get('/info', (request, response) => {
  const personsCount = persons.length;
  const dateTimeNow = new Date();
  const dateTimeString = dateTimeNow.toString();
  const responseText = `
    Phonebook has info for ${personsCount} people
    
    ${dateTimeString}
  `;
  response.setHeader('Content-Type', 'text/plain');
  response.send(responseText);
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    // Use status() for setting the status and end() for responding to the request without sending any data
    response.status(404).end()
    console.log(`Person with that Id, not found!`)
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    // // Validation: Ensure that new person name and number are in the POST body
    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'Credentials missing from post' 
        })
    }

    // Validation: Ensure that new person name is not already in use
    const nameExists = persons.find(p => p.name === body.name);
    if (nameExists) {
        return response.status(400).json({ 
            error: 'Name must be unique' 
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3002
app.listen(PORT)
console.log(`Server now running on port ${PORT}`)