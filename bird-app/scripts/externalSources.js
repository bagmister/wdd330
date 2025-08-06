const apiKeyParks = import.meta.env.apiKeyParks
const apiKeyBirds = import.meta.env.apiKeyBirds

import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`
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
