const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3030;
const dataDir = path.join(__dirname, 'data');
const reviewsPath = path.join(dataDir, 'reviews.json');
const dealershipsPath = path.join(dataDir, 'dealerships.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const loadJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const saveJson = (filePath, payload) => {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
};

app.get('/', async (req, res) => {
  res.send("Welcome to the Dealership API");
});

app.get('/fetchReviews', async (req, res) => {
  try {
    const reviews = loadJson(reviewsPath).reviews;
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const reviews = loadJson(reviewsPath).reviews;
    const documents = reviews.filter((review) => review.dealership === Number(req.params.id));
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealers', async (req, res) => {
  try {
    const dealerships = loadJson(dealershipsPath).dealerships;
    res.json(dealerships);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const dealerships = loadJson(dealershipsPath).dealerships;
    if (req.params.state === 'All') {
      return res.json(dealerships);
    }
    const documents = dealerships.filter(
      (dealer) => dealer.state.toLowerCase() === req.params.state.toLowerCase()
    );
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealerships = loadJson(dealershipsPath).dealerships;
    const documents = dealerships.filter((dealer) => dealer.id === Number(req.params.id));
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body;
    const reviewData = loadJson(reviewsPath);
    const documents = reviewData.reviews;
    const currentMaxId = documents.reduce((maxId, review) => Math.max(maxId, review.id), 0);
    const review = {
      id: currentMaxId + 1,
      name: data.name,
      dealership: Number(data.dealership),
      review: data.review,
      purchase: Boolean(data.purchase),
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: Number(data.car_year),
      sentiment: data.sentiment || 'neutral',
    };

    documents.push(review);
    saveJson(reviewsPath, reviewData);
    res.json(review);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
