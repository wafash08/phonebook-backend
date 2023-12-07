import express from "express";
import morgan from "morgan";

const app = express();

app.use(express.json());
morgan.token("person", (req, res) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :person"
  )
);
app.use(express.static("dist"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

function generateID() {
  const RANGE_OF_ID = 1000000;
  return Math.floor(Math.random() * RANGE_OF_ID);
}

app.post("/api/persons", (req, res) => {
  const person = req.body;
  if (!person.name || !person.number) {
    return res.status(400).json({
      error: "Field name or number is missing. Please fill those fields",
    });
  }
  const hasNewPerson = persons.find(p => p.name === person.name);
  if (hasNewPerson) {
    return res.status(400).json({
      error: `${person.name} is already in use`,
    });
  }
  const newPerson = {
    id: generateID(),
    ...person,
  };
  persons = [...persons, newPerson];
  res.json(newPerson);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find(p => p.id === Number(id));
  if (!person) {
    res.status(404).json({
      message: `Person with id ${id} you are looking for is not found`,
    });
  }
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const personToDelete = persons.find(p => p.id === id);
  if (!personToDelete) {
    res.status(404).json({
      message: `Person with id ${id} has already deleted from server`,
    });
  }
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});

app.get("/api/info", (req, res) => {
  const totalPerson = persons.length;
  const date = new Date();
  res.send(`<p>Phonebook has info for ${totalPerson} people</p><p>${date}</p>`);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
