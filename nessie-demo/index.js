const request = require('superagent');

const API_KEY = '5b55b663fcacb05e663e5ce3ea9815ff'; // replace with your key
const BASE_URL = 'http://api.nessieisreal.com';

request
  .get(`${BASE_URL}/atms?key=${API_KEY}`)
  .end((err, res) => {
    if (err) {
      console.error("Error:", err.message);
    } else {
      console.log("Status:", res.status);
      console.log("Response:", res.body);
    }
  });
