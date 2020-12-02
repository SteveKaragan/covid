
'use strict';
const urlCOVID = `https://api.covid19api.com/summary`
const urlPop = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=5000&date=2019`
const urlSixtyFive = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.65UP.TO.ZS?format=json&per_page=5000&date=2019`
const urlGDP = `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=5000&date=2019`



//set a variable equal to this and console log it with Rick, what is this?  How do you grab [[]]
//error handling?
function begin() {
  Promise.all([fetch(urlCOVID).then(response => response.json()), fetch(urlPop).then(response => response.json()),fetch(urlSixtyFive).then(response => response.json()),
    fetch(urlGDP).then(response => response.json())])
    .then((values) => grabData(values));//what is values
  };

let data = [];



//does this call the api everytime?  should I?
function grabData(values) {
  //is this considered hard coded?  Should I work differently?
  let covid = values[0].Countries
  let popTotal = values[1][1]; 
  let popOver65 = values[2][1];
  let gdpCapita = values[3][1];
  //I push the data to data because I could not figure out how to handle a promise object
  covid.forEach(country => data.push(country))
  //These just place the additional data in data by country code, is this an ok method?
  data.forEach(country => {
      let idx = popTotal.findIndex(country2 => country2.country.id === country.CountryCode)
      if (idx !== -1) country.population = popTotal[idx].value
      });
  data.forEach(country => {
    let idx = popOver65.findIndex(country2 => country2.country.id === country.CountryCode)
    if (idx !== -1) country.popOver65 = popOver65[idx].value
    });
  data.forEach(country => {
    let idx = gdpCapita.findIndex(country2 => country2.country.id === country.CountryCode)
    if (idx !== -1) country.gdp = gdpCapita[idx].value
    });
  //trying to format numbers, this was from NickC at thinkchat doesn't work, like this
  data.forEach(country => {
    for (let key in country) {
      if (typeof(country[key])==='number') {
        Number.parseFloat(country[key]).toFixed(2)
      };
    };
  });
    dataTransform(data)
}; 

function dataTransform(data) {
  data.forEach(country => country.casesPerMill = country.TotalConfirmed/(country.population/1000000))
  let rank = 0
  data.sort(function(a, b){
    return b.TotalConfirmed-a.TotalConfirmed
  });
  for (let i = 0; i < data.length; i++) {
    data[i].confirmedRank = i + 1
  }
  data.sort(function(a, b){
    return b.casesPerMill-a.casesPerMill
  });
  for (let i = 0; i < data.length; i++) {
    data[i].perMillRank = i + 1
  };
  data.sort(function(a, b){
    return b.population-a.population
  });
  for (let i = 0; i < data.length; i++) {
    data[i].populationRank = i + 1
  };
  
};

function generateLandingPage() {
  return `<div class="container">
  <p>Write up information about the project</p>
  <button type="button" id="js-main">Main Menu</button>
  <p id="js-error-message" class="error-message"></p>
</div>`
};

function renderLandingPage() {
  const landingPage = generateLandingPage();
  $('.js-listen-here').html(landingPage)
}

function handleMainMenu() {
  $('#js-main').click(function(){
    renderMainMenu()
  })
}

function generateMainMenu() {
  return `<div class='js-main-menu main-menu'>
  <button type="button">One Country</button><br>
  <button type="button">10 Top & Bottom</button><br>
  <button type="button" id="js-all-data">All Data</button>
</div>`
}

function renderMainMenu() {
  const mainMenu = generateMainMenu();
  $('.js-listen-here').html(mainMenu)
}

function handleAllData() {
  $('.js-listen-here').on('click', '#js-all-data', function(){
    console.log('hello')
    renderAllData()
  })
}

function generateAllData() {
  return `<div class="table-wrapper-scroll-y my-custom-scrollbar hidden">
        <table class="">
            <!-- here goes our data! -->
        </table>
    </div>`
}

function renderAllData() {
  const allData = generateAllData();
  $('main').html(allData)
  generateTable(data, displayTotFields)
  generateTableHead(headersTotFields)
}

function generateTableHead(header) {
  let table = document.querySelector("table");
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let i = 0; i < header.length; i++) {
    let th = document.createElement("th");
    let text = document.createTextNode(header[i]);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(data, array) {
  let table = document.querySelector("table");
  for (let i = 0; i < data.length; i++) {
    let row = table.insertRow();
    for (let j = 0; j < array.length; j++){
      let cell = row.insertCell();
      let text = document.createTextNode(data[i][array[j]]);
      cell.appendChild(text);
    }
  }
}

let allFields = ["Country", "CountryCode", "Slug", "NewConfirmed", "TotalConfirmed", "NewDeaths", "TotalDeaths", "NewRecovered", "TotalRecovered", "Date", "Premium",	"population",	"popOver65", "gdp",	"casesPerMill",	"confirmedRank", "perMillRank",	"populationRank"];
 let displayTotFields = ["Country", "TotalConfirmed", "confirmedRank", "casesPerMill",	"perMillRank", "population", "populationRank", "popOver65", "gdp"];
 let headersTotFields = ["Country", "Infections", "Infections Rank", "Infections per million",	"per million Rank", "Population", "Population Rank", "Population over 65", "GDP per Capita"];

  

  // function watchForm() {
  //   $('form').submit(event => {
  //     event.preventDefault();
  //     createCovidData(data)

  //   });
  // }

  function render() {
    begin()
    renderLandingPage()
    handleMainMenu()
    handleAllData()
  }
  
  $(render);

  
 