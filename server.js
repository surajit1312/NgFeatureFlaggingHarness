const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// handling CORS 
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin",
        "http://localhost:4200");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, X-Api-Key");
    next();
});

app.get('/', function (req, res) {
    res.send('Express running on port 3000!');
});

// route for handling requests from the Angular client 
app.post('/express/api/harness/getFeatures', (req, res) => {
    const HARNESS_API = req.body;
    const REQUEST_URL =
        `${HARNESS_API.baseURL}/${HARNESS_API.type}?accountIdentifier=${HARNESS_API.accountIdentifier}&orgIdentifier=${HARNESS_API.orgIdentifier}&projectIdentifier=${HARNESS_API.projectIdentifier}`;
    req.headers =
        axios.get(REQUEST_URL, { headers: { 'X-Api-Key': HARNESS_API.apiKey } })
            .then(response => {
                res.send(response.data);
            })
            .catch((error) => {
                res.send(error);
            });
});

app.post('/express/api/harness/updateFeature', (req, res) => {
    const HARNESS_API = req.body;
    const REQUEST_URL =
        `${HARNESS_API.baseURL}/${HARNESS_API.type}/${HARNESS_API.identifier}?accountIdentifier=${HARNESS_API.accountIdentifier}&orgIdentifier=${HARNESS_API.orgIdentifier}&projectIdentifier=${HARNESS_API.projectIdentifier}&environmentIdentifier=${HARNESS_API.environmentIdentifier}`;
    console.log(REQUEST_URL);
    req.headers =
        axios.patch(REQUEST_URL, HARNESS_API.payload, { headers: { 'X-Api-Key': HARNESS_API.apiKey } })
            .then(response => {
                res.send(response.data);
            })
            .catch((error) => {
                // console.log(error);
                res.send(error);
            });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
