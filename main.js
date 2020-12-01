
'use strict';
const urlCOVID = `https://api.covid19api.com/summary`
const urlPop = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=5000&date=2019`
const urlLife = `https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&per_page=5000&date=2019`
const urlSixtyFive = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.65UP.TO.ZS?format=json&per_page=5000&date=2019`
const urlGDP = `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=5000&date=2019`

let data = []

data = Promise.all([fetch(urlCOVID).then(response => response.json()), fetch(urlPop).then(response => response.json()),
  fetch(urlLife).then(response => response.json()),fetch(urlSixtyFive).then(response => response.json()),
  fetch(urlGDP).then(response => response.json())])
  .then((values) => grabData(values));



function grabData(values) {
  let covid = values[0].Countries //Covid data
  let popTotal = values[1][1] 
  let lifeExpec = values[2][1]
  let popOver65 = values[3][1]
  let gdpCapita = values[4][1]
  
  }

  function createCovidData(responseJson) {
    let covidArr = responseJson.Countries
    console.log(covidArr)
    for (let i = 0; i < covidArr.length; i++){
      $('#covid').append(
        `<li>
        ${covidArr[i].Country}, ${covidArr[i].CountryCode}, ${covidArr[i].TotalConfirmed}, ${covidArr[i].TotalDeaths}, ${covidArr[i].TotalRecovered}
        </li>`
      )};
  }


  

  // function watchForm() {
  //   $('form').submit(event => {
  //     event.preventDefault();
  //     getCovidData();
  //     getPopulationData()
  //   });
  // }
  
  // $(watchForm);

  
