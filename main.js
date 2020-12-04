
'use strict';
//BIG QUESTIONS:
//1. Do I need to collect, merge, and transform my data in another way?
//2. Error Handling
//3. Table formatting, data formatting, display, mobile--yikes!
//4. connected to 3 would Datatables in jQuery or some other display be better?

//URL's for Data API's
const urlCOVID = `https://api.covid19api.com/summary`
const urlPop = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=5000&date=2019`
const urlSixtyFive = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.65UP.TO.ZS?format=json&per_page=5000&date=2019`
const urlGDP = `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=5000&date=2019`

//what is asynchronicity, how does it manifest in this code?
//So I call new data everytimg the page reloads?  When could data values change?

//Promises/Fetch
//set a variable equal to this and console log it with Rick, what is this?  How do you grab [[]]
//error handling? or do I need something like:
// .then(response => {
//   if (response.ok) {
//     return response.json();
//   }
//   throw new Error(response.statusText);
// })
// .then(responseJson => displayResults(responseJson))
// .catch(err => {
//   $('#js-error-message').text(`Something went wrong: ${err.message}`);
// });
function begin() {
  Promise.all([fetch(urlCOVID).then(response => response.json()), fetch(urlPop).then(response => response.json()),fetch(urlSixtyFive).then(response => response.json()),
    fetch(urlGDP).then(response => response.json())])
    .then((values) => grabData(values)).catch((error) => {
      console.log(error)
   });//what is values?
  };

//Attempt to get data into global scope
let data = [];

//in this function, I try to create a common store, "data"--an array of objects.  Each object is a country.
//I use this funtion to bring data together in one array.
function grabData(values) {
  //is there a better way to define these?  I could not get at the individual arrays from values in the global scope.
  let covid = values[0].Countries
  let popTotal = values[1][1]; 
  let popOver65 = values[2][1];
  let gdpCapita = values[3][1];
  //I push the data to data because I could not figure out how to handle a promise object.  This makes data, the same
  //as the data pulled from the COVID API
  covid.forEach(country => data.push(country))
  //These three functions take the World bank data and place it in each country object by matching country code.
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

//I added ranking data for each of the world bank data.  I thought it would make sorting/selecting data easier.
//So this function creates new data in three ranking fields from 1 to ...
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

//These two functions make the landing/info page for the app
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

//These three functions are the main menu that supports the three main views of the data
function handleMainMenu() {
  $('#js-main').click(function(){
    renderMainMenu()
  })
}

function generateMainMenu() {
  return `<div class='js-main-menu main-menu'>
  <button type="button" id="js-country">One Country</button><br>
  <button type="button" id="js-ten">10 Highest & 10 Lowest</button><br>
  <button type="button" id="js-all-data">All Data</button>
</div>`
}

function renderMainMenu() {
  const mainMenu = generateMainMenu();
  $('.js-listen-here').html(mainMenu)
}

//These functions are to show one country selector
function handleCountrySelector() {
  $('.js-listen-here').on('click', '#js-country', function(){
    renderCountrySelector()
  })
}

function generateCountrySelector() {
  //This sort does not make them appear in alpha order?
  const options = data.sort(function(a, b){
    return a.Country-b.Country
  }).map(country => {
    return `
    <option value="${country.CountryCode}">${country.Country}</option>
    `
  })
  return `
  <form action="" id="country">
  <label for="country">Select A Country</label>
  <select name="country" id="select" form="country">
      ${options.join(" ")}
  </select>
</form>`
}

function renderCountrySelector() {
  const countryData = generateCountrySelector();
  $('.js-listen-here').html(countryData)
}

//These functions are to show data for country selected
function handleCountryData() {
  $('.js-listen-here').on('change', '#select', function(){
    renderCountryData()
  })
} 
//how do I get this to render and keep the selector available?
//need to add Main button
function generateCountryData() {
  let e = document.getElementById("select");
  let countryCode = e.value;
  let countryArr = data.filter(country => country.CountryCode === countryCode)
  let country = countryArr[0]
  console.log(country)
  return `
  <div id=>
    <p> ${country.Country} is ranked number ${country.confirmedRank} in the world for total COVID infection. ${country.Country} has had ${country.TotalConfirmed} infections.  However, ${country.Country} is ranked
    ${country.perMillRank} in infections per million with an infection rate of ${country.casesPerMill} per million.  ${country.Country} has a population of ${country.population}, and is 
    ranked ${country.populationRank} in the world by population.  ${country.Country} has had ${country.TotalDeaths} deaths due to COVID. ${country.Country} has a population over 65 of ${country.popOver65} million,
    and a GDP per capita of ${country.gdp}.  World wide GDP per capita is $11,428 for 2019 in current USD.
    </p>
  </div>`
}

["Country", "CountryCode", "Slug", "NewConfirmed", "TotalConfirmed", "NewDeaths", "TotalDeaths", "NewRecovered", "TotalRecovered", "Date", "Premium",	"population",	"popOver65", "gdp",	"casesPerMill",	"confirmedRank", "perMillRank",	"populationRank"];

function renderCountryData() {
  const countryData = generateCountryData();
  $('.js-listen-here').html(countryData)
}


//These functions create the "All Data View" from the button on the main menu, the button takes
//you back to the main menu
function handleAllData() {
  $('.js-listen-here').on('click', '#js-all-data', function(){
    renderAllData()
  })
}

function generateAllData() {
  return `<div class="table-wrapper-scroll-y my-custom-scrollbar hidden">
  <button type="button" id="js-main">Main Menu</button>      
  <table class="">
            <!-- here goes our data! -->
        </table>
    </div>`
}

function renderAllData() {
  const allData = generateAllData();
  $('.js-listen-here').html(allData)
  generateTable(data, displayTotFields)
  generateTableHead(headersTotFields)
}

function handleBackMainMenu() {
  $('.js-listen-here').on('click', '#js-main', function(){
    renderMainMenu()
  })
}

//These functions create the "10 high/10 low" from the button on the main menu, the button takes
//you back to the main menu, How much do I want to do here?
function handleTenData() {
  $('.js-listen-here').on('click', '#js-ten', function(){
    renderTenData()
  })
}

function generateTenData() {
  return `<div class="table-wrapper-scroll-y my-custom-scrollbar hidden">
    <button type="button" id="js-main">Main Menu</button>      
    <table>
            <!-- here goes our data! -->
        </table>
    </div>`
}

function renderTenData() {
  const tenData = generateTenData();
  $('.js-listen-here').html(tenData)
  data.sort(function(a, b){
    return a.confirmedRank-b.confirmedRank
  });
  generateTable(data, displayInfections, 10)
  generateTableHead(headersInfections)
}

//These two functions and the arrays beneath are responsible for creating the tables for all views of the data
//I think there are Datatables in jQuery, but the wireframe said get it done as fast as possible.
function generateTableHead(header) {
  let table = document.querySelector('table');
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let i = 0; i < header.length; i++) {
    let th = document.createElement("th");
    let text = document.createTextNode(header[i]);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(data, array, renNum=data.length) {
  let table = document.querySelector('table');
  for (let i = 0; i < renNum; i++) {
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
let displayInfections = ["confirmedRank", "Country", "TotalConfirmed"]
let headersInfections = ["Infections Rank", "Country", "Infections"]
console.log(data)

  function render() {
    begin()
    renderLandingPage()
    handleMainMenu()
    handleAllData()
    handleBackMainMenu()
    handleTenData()
    handleCountrySelector()
    handleCountryData()  
  }
  
  $(render);

  
 