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

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then(p => res.json(p))
    .catch(error => {
      next(error);
    });
});

app.post("/api/persons", (req, res, next) => {
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
  person
    .save()
    .then(p => res.json(p))
    .catch(error => {
      next(error);
    });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(p => {
      if (!p) {
        res.status(404).json({
          message: `Person with id ${id} you are looking for is not found`,
        });
      }
      res.json(p);
    })
    .catch(error => {
      next(error);
    });
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const person = { name: body.name, number: body.number };
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(p => {
      res.json(p);
    })
    .catch(error => {
      next(error);
    });
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

app.get("/api/info", (req, res, next) => {
  Person.find({})
    .then(p => {
      const date = new Date();
      const totalPerson = p.length;
      res.send(
        `<p>Phonebook has info for ${totalPerson} people</p><p>${date}</p>`
      );
    })
    .catch(error => {
      next(error);
    });
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
