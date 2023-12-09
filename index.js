import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import Person from './models/person.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));
// eslint-disable-next-line no-unused-vars
morgan.token('person', (req, res) => {
	return JSON.stringify(req.body);
});
app.use(
	morgan(
		':method :url :status :res[content-length] - :response-time ms :person'
	)
);

app.get('/api/persons', (req, res, next) => {
	Person.find({})
		.then(p => res.json(p))
		.catch(error => {
			next(error);
		});
});

app.post('/api/persons', (req, res, next) => {
	const { name, number } = req.body;
	const person = new Person({
		name,
		number,
	});
	person
		.save()
		.then(p => {
			res.json(p);
		})
		.catch(error => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then(p => {
			if (!p) {
				res.status(404).json({
					message: `Person with id ${req.params.id} you are looking for is not found`,
				});
			}
			res.json(p);
		})
		.catch(error => {
			next(error);
		});
});

app.put('/api/persons/:id', (req, res, next) => {
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

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndDelete(req.params.id)
		.then(p => {
			console.log('deleted >> ', p);
			res.status(204).end();
		})
		.catch(error => {
			next(error);
		});
});

app.get('/api/info', (req, res, next) => {
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

	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' });
	} else if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message });
	}

	next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
