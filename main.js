
'use strict';

const urlCOVID = `https://api.covid19api.com/summary`
const urlPop = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=5000&date=2019`
const urlSixtyFive = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.65UP.TO.ZS?format=json&per_page=5000&date=2019`
const urlGDP = `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=5000&date=2019`

function begin() {
  Promise.all([fetch(urlCOVID).then(response => response.json()), fetch(urlPop).then(response => response.json()),fetch(urlSixtyFive).then(response => response.json()),
    fetch(urlGDP).then(response => response.json())]).then((values) => grabData(values)).catch((error) => {
      $('#js-error-message').text(`Something went wrong: ${error.message}`)
   });
  };

const store = {
  data: [],
  summary: {},
};

function grabData(values) {
  console.log(values)
  //is there a better way to define these?  Is this hard coded?
  let covid = values[0].Countries
  let popTotal = values[1][1]; 
  let popOver65 = values[2][1];
  let gdpCapita = values[3][1];
  //I push the data to data because I could not figure out how to handle a promise object.  This makes data, the same
  //as the data pulled from the COVID API, but I could not just set data = to a function that returned covid.
  //Should I format data here?
  covid.forEach(country => store.data.push(country))
  //These three functions take the World bank data and place it in each country object by matching country code.
  store.data.forEach(country => {
      let idx = popTotal.findIndex(country2 => country2.country.id === country.CountryCode)
      country.population = (idx !== -1) ? popTotal[idx].value : null
      });
  store.data.forEach(country => {
    let idx = popOver65.findIndex(country2 => country2.country.id === country.CountryCode)
    country.popOver65 = (idx !== -1) ? popOver65[idx].value : null
    });
  store.data.forEach(country => {
    let idx = gdpCapita.findIndex(country2 => country2.country.id === country.CountryCode)
    country.gdp = (idx !== -1) ? gdpCapita[idx].value : null
    });
    dataTransform(store.data)
}; 

//I added ranking data for each of the world bank data.  I thought it would make sorting/selecting data easier.
//So this function creates new data in three ranking fields from 1 to ...
function dataTransform(data) {
  data.forEach(country => country.casesPerMill = (country.population) ? country.TotalConfirmed/(country.population/1000000) : null);
  let rank = 0
  data.sort(function(a, b){
    return b.TotalConfirmed-a.TotalConfirmed
  });
  for (let i = 0; i < data.length; i++) {
    data[i].confirmedRank = i + 1
  };
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
  dataSummarize(data)
};


//so I am rendering landing page here, because otherwise the summary data does not appear.
function dataSummarize(data) {
  store.summary.infections = Number(data.reduce((ac, cv) => ac + cv.TotalConfirmed, 0)/1000000).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})
  store.summary.deaths = Number(data.reduce((ac, cv) => ac + cv.TotalDeaths, 0)/1000000).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})
  store.summary.recovered = Number(data.reduce((ac, cv) => ac + cv.TotalRecovered, 0)/1000000).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})
  store.summary.population = Number(data.reduce((ac, cv) => ac + cv.population, 0)/1000000).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})
  store.summary.popOver65 = Number(data.reduce((ac, cv) => ac + cv.popOver65, 0)).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})
  store.summary.infectPerMill = Number(store.summary.infections /(store.summary.population / 1000000)).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})
  store.summary.infectRate = Number(store.summary.infections / store.summary.population).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})
  renderLandingPage()
};

//These two functions make the landing/info page for the app
function generateLandingPage() {
  return `
  <h2>Site Information</h2>
  <img src="/images/covid.jpeg" alt="COVID Virus">
  <div class="container">
  <p>This site has been created to help the average person get a better, more quantitative perspective of coronavirus cases world-wide
        by country. Coronavirus data from <a href="https://covid19api.com/">Covid19 API</a>, sourced from Johns Hopkins, 
        and other country level data from <a href="https://data.worldbank.org/">The World Bank</a> have been utilized.</p> 
        
        <p>The hope is that by making data readily available, displaying it by country, and using some simple calculations, that we can come to a better, data-driven understanding of the scope of the pandemic in different countries and contemplate possible causes of 
        difference.  We will simply try to show by incorporating country level population data, the dramatic difference by country between total number of cases
        and cases per million of population.
    </p>

    <p>Based on the data from the sources above there have been ${store.summary.infections} million coronavirus cases world-wide. ${store.summary.deaths}
    million people have died, and ${store.summary.recovered} million people have recovered.</p>
    <div class="button">
    <button type="button" id="js-main">Main Menu</button>
    </div>
</div>
<footer></footer>`
};

function renderLandingPage() {
  const landingPage = generateLandingPage();
  $('.js-listen-here').html(landingPage);
};

//These three functions are the main menu that supports the three main views of the data
function handleMainMenu() {
  $('#js-main').click(function(){
    renderMainMenu();
  });
};

function generateMainMenu() {
  return `
  <h2>Main Menu</h2>
  <div class='js-main-menu main-menu container'>
  <button type="button" id="js-ten">Top 10 Data</button>
  <p>Top 10 Data shows the 10 countries with the highest number of COVID cases, their world rank based on population, and world rank in cases per million</p>
  <button type="button" id="js-country">Country Analysis</button>
  <p>Country Analysis allows you to select any country and get a summary of its related data</p>
  <button type="button" id="js-all-data">All Data</button>
  <p>All Data displays all the data for each country in a table format</p>
  </div>
  <footer></footer>`
  
};

function renderMainMenu() {
  const mainMenu = generateMainMenu();
  $('.js-listen-here').html(mainMenu);
  $('.js-listen-here-2').empty()
};

//These functions create the "10 high/10 low" from the button on the main menu, the button takes
//you back to the main menu, How much do I want to do here?
function handleTenData() {
  $('.js-listen-here').on('click', '#js-ten', function(){
    renderTopTenData()
  });
};
//Would this be easier to do as an ordered list?
function generateTopTenData() {
  return `
  <h2>Top 10 Data</h2>
  <div class="table-wrapper-scroll-y my-custom-scrollbar hidden">
         
    <table>
            <!-- here goes our data! -->
        </table>
      <div class="button">
        <button type="button" id="js-main" class="main-button">Main Menu</button> 
      </div>
    </div>
    <footer></footer>`
};

function renderTopTenData() {
  const tenData = generateTopTenData();
  $('.js-listen-here').html(tenData)
  store.data.sort(function(a, b){
    return a.confirmedRank-b.confirmedRank
  });
  generateTable(store.data, displayCases, 10);
  generateTableHead(headersCases);
};

//These functions are to show one country selector
function handleCountrySelector() {
  $('.js-listen-here').on('click', '#js-country', function(){
    renderCountrySelector();
  });
};

function generateCountrySelector() {
  //This sort does not make them appear in alpha order? Nick C. on thinkchat thinks this is an async issue
  const options = store.data.sort(function (ca, cb) {
    const a = ca.Country;
    const b = cb.Country;
    if (a < b) {
        return -1;
    }
    if (b > a) {
        return 1;
    }
    return 0;
    }).map(country => {
    return `
    <option value="${country.CountryCode}">${country.Country}</option>
    `
  });
  return `
  <h2>Country Analysis</h2>
  <form action="" id="country" class="form">
  <label for="country">Select A Country</label>
  <select name="country" id="select" form="country">
      ${options.join(" ")}
  </select><br>
  <div class="button">
  <button type="button" id="js-main">Main Menu</button>
  </div>
</form>

<footer></footer>`
};

function renderCountrySelector() {
  const countryData = generateCountrySelector();
  $('.js-listen-here').html(countryData)
};

//These functions are to show data for country selected
function handleCountryData() {
  $('.js-listen-here').on('change', '#select', function(){
    renderCountryData()
  });
}; 
//selector issue, how do I clear .js-listen-here-2
function generateCountryData() {
  let e = document.getElementById("select");
  let countryCode = e.value;
  let countryArr = store.data.filter(country => country.CountryCode === countryCode)
  let country = countryArr[0]
  return `
  <div class="container">
    <p> ${country.Country} is ranked number ${country.confirmedRank} in the world for total COVID infection. ${country.Country} has had ${Number(country.TotalConfirmed).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})} infections.  However, ${country.Country} is ranked
    number ${country.perMillRank} in cases per million with a rate of ${Number(country.casesPerMill).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})} cases per million.  ${country.Country} has a population of ${Number(country.population/1000000).toLocaleString(undefined,{ minimumFractionDigits: 1, maximumFractionDigits: 1})} million, and is 
    ranked number ${country.populationRank} in the world by population.  ${country.Country} has had ${Number(country.TotalDeaths).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})} deaths due to COVID. ${country.Country} has a population over 65 years of age of ${Number(country.popOver65).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 1})} million,
    and a GDP per capita of USD ${Number(country.gdp).toLocaleString(undefined,{ minimumFractionDigits: 0, maximumFractionDigits: 0})} in 2019 current dollars.  World wide GDP per capita is USD 11,428 for 2019 in current USD.
    </p>
  </div>
  <footer></footer>`
};

function renderCountryData() {
  const countryData = generateCountryData();
  $('.js-listen-here-2').html(countryData)
};


//These functions create the "All Data View" from the button on the main menu, the button takes
//you back to the main menu
function handleAllData() {
  $('.js-listen-here').on('click', '#js-all-data', function(){
    renderAllData();
  });
};

function generateAllData() {
  return `
  <h2>All Data Table</h2>
  <div class="table-wrapper-scroll-y my-custom-scrollbar button hidden">
  <button type="button" id="js-main">Main Menu</button> 
  <table class="">
            <!-- here goes our data! -->
        </table>  
    </div>
    <footer></footer>`
};

function renderAllData() {
  const allData = generateAllData();
  $('.js-listen-here').html(allData)
  store.data.sort(function(a, b){
    return a.perMillRank-b.perMillRank
  });
  generateTable(store.data, displayTotFields);
  generateTableHead(headersTotFields);
};

function handleBackMainMenu() {
  $('.js-listen-here').on('click', '#js-main', function(){
    renderMainMenu();
  });
};

//These two functions and the arrays beneath are responsible for creating the tables for all views of the data
//But, when I start thinking about how to render more than one table on a page this gets complicated!
function generateTableHead(header) {
  let table = document.querySelector('table');
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let i = 0; i < header.length; i++) {
    let th = document.createElement("th");
    let text = document.createTextNode(header[i]);
    th.appendChild(text);
    row.appendChild(th);
  };
};

function generateTable(data, array, renNum=data.length) {
  let table = document.querySelector('table');
  let text  
  for (let i = 0; i < renNum; i++) {
    let row = table.insertRow();
    for (let j = 0; j < array.length; j++){
      let cell = row.insertCell();
        text = document.createTextNode(array[j] !=="Country" ?
          Number(data[i][array[j]]).toLocaleString(
          undefined,
          { minimumFractionDigits: 0, maximumFractionDigits: 1})
          : data[i][array[j]]);
      cell.appendChild(text);
    };
  };
};


//Is this ok?  Is this hard coded?
let allFields = ["Country", "CountryCode", "Slug", "NewConfirmed", "TotalConfirmed", "NewDeaths", "TotalDeaths", "NewRecovered", "TotalRecovered", "Date", "Premium",	"population",	"popOver65", "gdp",	"casesPerMill",	"confirmedRank", "perMillRank",	"populationRank"];
let displayTotFields = ["Country", "casesPerMill",	"perMillRank", "TotalConfirmed", "confirmedRank", "population", "populationRank"];
let headersTotFields = ["Country", "Cases per million",	"per million Rank", "Cases", "Cases Rank", "Population", "Population Rank"];
let displayCases = ["Country", "confirmedRank", "TotalConfirmed", "populationRank", "population", "perMillRank", "casesPerMill"]
let headersCases = ["Country", "Cases Rank", "Cases", "populationRank", "population", "per million Rank", "Cases per million"] 

function render() {
  begin();
  handleMainMenu();
  handleAllData();
  handleBackMainMenu();
  handleTenData();
  handleCountrySelector();
  handleCountryData(); 
};
  
$(render);

  
 