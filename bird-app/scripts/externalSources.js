const apiKeyParks = import.meta.env.apiKeyParks
const apiKeyBirds = import.meta.env.apiKeyBirds

import { setupCounter } from './counter.js'

export default class ExternalServices {
  constructor() {

  }
  async setUpconnection(source,) {
    if (source === 1) {
      let url = 'https://developer.nps.gov/api/v1/';
      let apiKey = apiKeyParks
    } else {
      let url = 'https://jsonplaceholder.typicode.com/users';
      let apiKey = apiKeyBirds
    }
    return url, apiKey
  }

  async buildRequest(url, apiKey) {
    let request = new Request(url, {
      method: 'get',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Api-Key': apiKey
      })
    });

    fetch(request)
      .then(function () {
        // Handle response you get from the API
      });
  }
}


setupCounter(document.querySelector('#counter'))
