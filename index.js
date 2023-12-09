import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import Person from "./models/person.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
morgan.token("person", (req, res) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :person"
  )
);

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
  Person.find({}).then(p => res.json(p));
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Field name or number is missing. Please fill those fields",
    });
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then(p => res.json(p));
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

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(p => {
      console.log("deleted >> ", p);
      res.status(204).end();
    })
    .catch(error => {
      next(error);
    });
});

app.get("/api/info", (req, res) => {
  const totalPerson = persons.length;
  const date = new Date();
  res.send(`<p>Phonebook has info for ${totalPerson} people</p><p>${date}</p>`);
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
