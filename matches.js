const matches = [
  {
    "date_text": "Thursday, June 11, 2026",
    "time_utc": "2026-06-11T19:00:00Z",
    "team1": "Mexico",
    "team2": "South Africa",
    "group": "Group A",
    "venue": "Estadio Azteca, Mexico City"
  },
  {
    "date_text": "Friday, June 12, 2026",
    "time_utc": "2026-06-12T02:00:00Z",
    "team1": "South Korea",
    "team2": "Czech Republic",
    "group": "Group A",
    "venue": "Estadio Akron, Guadalajara"
  },
  {
    "date_text": "Friday, June 12, 2026",
    "time_utc": "2026-06-12T19:00:00Z",
    "team1": "Canada",
    "team2": "Bosnia & Herzegovina",
    "group": "Group B",
    "venue": "BMO Field, Toronto"
  },
  {
    "date_text": "Saturday, June 13, 2026",
    "time_utc": "2026-06-13T01:00:00Z",
    "team1": "USA",
    "team2": "Paraguay",
    "group": "Group D",
    "venue": "SoFi Stadium, Los Angeles"
  },
  {
    "date_text": "Saturday, June 13, 2026",
    "time_utc": "2026-06-13T19:00:00Z",
    "team1": "Qatar",
    "team2": "Switzerland",
    "group": "Group B",
    "venue": "Levi's Stadium, San Francisco Bay Area"
  },
  {
    "date_text": "Saturday, June 13, 2026",
    "time_utc": "2026-06-13T22:00:00Z",
    "team1": "Brazil",
    "team2": "Morocco",
    "group": "Group C",
    "venue": "MetLife Stadium, New York/New Jersey"
  },
  {
    "date_text": "Sunday, June 14, 2026",
    "time_utc": "2026-06-14T01:00:00Z",
    "team1": "Haiti",
    "team2": "Scotland",
    "group": "Group C",
    "venue": "Gillette Stadium, Boston"
  },
  {
    "date_text": "Sunday, June 14, 2026",
    "time_utc": "2026-06-14T04:00:00Z",
    "team1": "Australia",
    "team2": "Turkey",
    "group": "Group D",
    "venue": "BC Place, Vancouver"
  },
  {
    "date_text": "Sunday, June 14, 2026",
    "time_utc": "2026-06-14T17:00:00Z",
    "team1": "Germany",
    "team2": "Curaçao",
    "group": "Group E",
    "venue": "NRG Stadium, Houston"
  },
  {
    "date_text": "Sunday, June 14, 2026",
    "time_utc": "2026-06-14T20:00:00Z",
    "team1": "Netherlands",
    "team2": "Japan",
    "group": "Group F",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Sunday, June 14, 2026",
    "time_utc": "2026-06-14T23:00:00Z",
    "team1": "Ivory Coast",
    "team2": "Ecuador",
    "group": "Group E",
    "venue": "Lincoln Financial Field, Philadelphia"
  },
  {
    "date_text": "Monday, June 15, 2026",
    "time_utc": "2026-06-15T02:00:00Z",
    "team1": "Sweden",
    "team2": "Tunisia",
    "group": "Group F",
    "venue": "Estadio BBVA, Monterrey"
  },
  {
    "date_text": "Monday, June 15, 2026",
    "time_utc": "2026-06-15T16:00:00Z",
    "team1": "Spain",
    "team2": "Cape Verde",
    "group": "Group H",
    "venue": "Mercedes-Benz Stadium, Atlanta"
  },
  {
    "date_text": "Monday, June 15, 2026",
    "time_utc": "2026-06-15T19:00:00Z",
    "team1": "Belgium",
    "team2": "Egypt",
    "group": "Group G",
    "venue": "Lumen Field, Seattle"
  },
  {
    "date_text": "Monday, June 15, 2026",
    "time_utc": "2026-06-15T22:00:00Z",
    "team1": "Saudi Arabia",
    "team2": "Uruguay",
    "group": "Group H",
    "venue": "Hard Rock Stadium, Miami"
  },
  {
    "date_text": "Tuesday, June 16, 2026",
    "time_utc": "2026-06-16T01:00:00Z",
    "team1": "Iran",
    "team2": "New Zealand",
    "group": "Group G",
    "venue": "SoFi Stadium, Los Angeles"
  },
  {
    "date_text": "Tuesday, June 16, 2026",
    "time_utc": "2026-06-16T19:00:00Z",
    "team1": "France",
    "team2": "Senegal",
    "group": "Group I",
    "venue": "MetLife Stadium, New York/New Jersey"
  },
  {
    "date_text": "Tuesday, June 16, 2026",
    "time_utc": "2026-06-16T22:00:00Z",
    "team1": "Iraq",
    "team2": "Norway",
    "group": "Group I",
    "venue": "Gillette Stadium, Boston"
  },
  {
    "date_text": "Wednesday, June 17, 2026",
    "time_utc": "2026-06-17T01:00:00Z",
    "team1": "Argentina",
    "team2": "Algeria",
    "group": "Group J",
    "venue": "GEHA Field at Arrowhead Stadium, Kansas City"
  },
  {
    "date_text": "Wednesday, June 17, 2026",
    "time_utc": "2026-06-17T04:00:00Z",
    "team1": "Austria",
    "team2": "Jordan",
    "group": "Group J",
    "venue": "Levi's Stadium, San Francisco Bay Area"
  },
  {
    "date_text": "Wednesday, June 17, 2026",
    "time_utc": "2026-06-17T17:00:00Z",
    "team1": "Portugal",
    "team2": "DR Congo",
    "group": "Group K",
    "venue": "NRG Stadium, Houston"
  },
  {
    "date_text": "Wednesday, June 17, 2026",
    "time_utc": "2026-06-17T20:00:00Z",
    "team1": "England",
    "team2": "Croatia",
    "group": "Group L",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Wednesday, June 17, 2026",
    "time_utc": "2026-06-17T23:00:00Z",
    "team1": "Ghana",
    "team2": "Panama",
    "group": "Group L",
    "venue": "BMO Field, Toronto"
  },
  {
    "date_text": "Thursday, June 18, 2026",
    "time_utc": "2026-06-18T02:00:00Z",
    "team1": "Uzbekistan",
    "team2": "Colombia",
    "group": "Group K",
    "venue": "Estadio Azteca, Mexico City"
  },
  {
    "date_text": "Thursday, June 18, 2026",
    "time_utc": "2026-06-18T16:00:00Z",
    "team1": "Czech Republic",
    "team2": "South Africa",
    "group": "Group A",
    "venue": "Mercedes-Benz Stadium, Atlanta"
  },
  {
    "date_text": "Thursday, June 18, 2026",
    "time_utc": "2026-06-18T19:00:00Z",
    "team1": "Switzerland",
    "team2": "Bosnia & Herzegovina",
    "group": "Group B",
    "venue": "SoFi Stadium, Los Angeles"
  },
  {
    "date_text": "Thursday, June 18, 2026",
    "time_utc": "2026-06-18T22:00:00Z",
    "team1": "Canada",
    "team2": "Qatar",
    "group": "Group B",
    "venue": "BC Place, Vancouver"
  },
  {
    "date_text": "Friday, June 19, 2026",
    "time_utc": "2026-06-19T01:00:00Z",
    "team1": "Mexico",
    "team2": "South Korea",
    "group": "Group A",
    "venue": "Estadio Akron, Guadalajara"
  },
  {
    "date_text": "Friday, June 19, 2026",
    "time_utc": "2026-06-19T19:00:00Z",
    "team1": "USA",
    "team2": "Australia",
    "group": "Group D",
    "venue": "Lumen Field, Seattle"
  },
  {
    "date_text": "Friday, June 19, 2026",
    "time_utc": "2026-06-19T22:00:00Z",
    "team1": "Scotland",
    "team2": "Morocco",
    "group": "Group C",
    "venue": "Gillette Stadium, Boston"
  },
  {
    "date_text": "Saturday, June 20, 2026",
    "time_utc": "2026-06-20T00:30:00Z",
    "team1": "Brazil",
    "team2": "Haiti",
    "group": "Group C",
    "venue": "Lincoln Financial Field, Philadelphia"
  },
  {
    "date_text": "Saturday, June 20, 2026",
    "time_utc": "2026-06-20T03:00:00Z",
    "team1": "Turkey",
    "team2": "Paraguay",
    "group": "Group D",
    "venue": "Levi's Stadium, San Francisco Bay Area"
  },
  {
    "date_text": "Saturday, June 20, 2026",
    "time_utc": "2026-06-20T17:00:00Z",
    "team1": "Netherlands",
    "team2": "Sweden",
    "group": "Group F",
    "venue": "NRG Stadium, Houston"
  },
  {
    "date_text": "Saturday, June 20, 2026",
    "time_utc": "2026-06-20T20:00:00Z",
    "team1": "Germany",
    "team2": "Ivory Coast",
    "group": "Group E",
    "venue": "BMO Field, Toronto"
  },
  {
    "date_text": "Sunday, June 21, 2026",
    "time_utc": "2026-06-21T00:00:00Z",
    "team1": "Ecuador",
    "team2": "Curaçao",
    "group": "Group E",
    "venue": "GEHA Field at Arrowhead Stadium, Kansas City"
  },
  {
    "date_text": "Sunday, June 21, 2026",
    "time_utc": "2026-06-21T04:00:00Z",
    "team1": "Tunisia",
    "team2": "Japan",
    "group": "Group F",
    "venue": "Estadio BBVA, Monterrey"
  },
  {
    "date_text": "Sunday, June 21, 2026",
    "time_utc": "2026-06-21T16:00:00Z",
    "team1": "Spain",
    "team2": "Saudi Arabia",
    "group": "Group H",
    "venue": "Mercedes-Benz Stadium, Atlanta"
  },
  {
    "date_text": "Sunday, June 21, 2026",
    "time_utc": "2026-06-21T19:00:00Z",
    "team1": "Belgium",
    "team2": "Iran",
    "group": "Group G",
    "venue": "SoFi Stadium, Los Angeles"
  },
  {
    "date_text": "Sunday, June 21, 2026",
    "time_utc": "2026-06-21T22:00:00Z",
    "team1": "Uruguay",
    "team2": "Cape Verde",
    "group": "Group H",
    "venue": "Hard Rock Stadium, Miami"
  },
  {
    "date_text": "Monday, June 22, 2026",
    "time_utc": "2026-06-22T01:00:00Z",
    "team1": "New Zealand",
    "team2": "Egypt",
    "group": "Group G",
    "venue": "BC Place, Vancouver"
  },
  {
    "date_text": "Monday, June 22, 2026",
    "time_utc": "2026-06-22T17:00:00Z",
    "team1": "Argentina",
    "team2": "Austria",
    "group": "Group J",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Monday, June 22, 2026",
    "time_utc": "2026-06-22T21:00:00Z",
    "team1": "France",
    "team2": "Iraq",
    "group": "Group I",
    "venue": "Lincoln Financial Field, Philadelphia"
  },
  {
    "date_text": "Tuesday, June 23, 2026",
    "time_utc": "2026-06-23T00:00:00Z",
    "team1": "Norway",
    "team2": "Senegal",
    "group": "Group I",
    "venue": "MetLife Stadium, New York/New Jersey"
  },
  {
    "date_text": "Tuesday, June 23, 2026",
    "time_utc": "2026-06-23T03:00:00Z",
    "team1": "Jordan",
    "team2": "Algeria",
    "group": "Group J",
    "venue": "Levi's Stadium, San Francisco Bay Area"
  },
  {
    "date_text": "Tuesday, June 23, 2026",
    "time_utc": "2026-06-23T17:00:00Z",
    "team1": "Portugal",
    "team2": "Uzbekistan",
    "group": "Group K",
    "venue": "NRG Stadium, Houston"
  },
  {
    "date_text": "Tuesday, June 23, 2026",
    "time_utc": "2026-06-23T20:00:00Z",
    "team1": "England",
    "team2": "Ghana",
    "group": "Group L",
    "venue": "Gillette Stadium, Boston"
  },
  {
    "date_text": "Tuesday, June 23, 2026",
    "time_utc": "2026-06-23T23:00:00Z",
    "team1": "Panama",
    "team2": "Croatia",
    "group": "Group L",
    "venue": "BMO Field, Toronto"
  },
  {
    "date_text": "Wednesday, June 24, 2026",
    "time_utc": "2026-06-24T02:00:00Z",
    "team1": "Colombia",
    "team2": "DR Congo",
    "group": "Group K",
    "venue": "Estadio Akron, Guadalajara"
  },
  {
    "date_text": "Wednesday, June 24, 2026",
    "time_utc": "2026-06-24T19:00:00Z",
    "team1": "Switzerland",
    "team2": "Canada",
    "group": "Group B",
    "venue": "BC Place, Vancouver"
  },
  {
    "date_text": "Wednesday, June 24, 2026",
    "time_utc": "2026-06-24T19:00:00Z",
    "team1": "Bosnia & Herzegovina",
    "team2": "Qatar",
    "group": "Group B",
    "venue": "Lumen Field, Seattle"
  },
  {
    "date_text": "Wednesday, June 24, 2026",
    "time_utc": "2026-06-24T22:00:00Z",
    "team1": "Scotland",
    "team2": "Brazil",
    "group": "Group C",
    "venue": "Hard Rock Stadium, Miami"
  },
  {
    "date_text": "Wednesday, June 24, 2026",
    "time_utc": "2026-06-24T22:00:00Z",
    "team1": "Morocco",
    "team2": "Haiti",
    "group": "Group C",
    "venue": "Mercedes-Benz Stadium, Atlanta"
  },
  {
    "date_text": "Thursday, June 25, 2026",
    "time_utc": "2026-06-25T01:00:00Z",
    "team1": "Czech Republic",
    "team2": "Mexico",
    "group": "Group A",
    "venue": "Estadio Azteca, Mexico City"
  },
  {
    "date_text": "Thursday, June 25, 2026",
    "time_utc": "2026-06-25T01:00:00Z",
    "team1": "South Africa",
    "team2": "South Korea",
    "group": "Group A",
    "venue": "Estadio BBVA, Monterrey"
  },
  {
    "date_text": "Thursday, June 25, 2026",
    "time_utc": "2026-06-25T20:00:00Z",
    "team1": "Curaçao",
    "team2": "Ivory Coast",
    "group": "Group E",
    "venue": "Lincoln Financial Field, Philadelphia"
  },
  {
    "date_text": "Thursday, June 25, 2026",
    "time_utc": "2026-06-25T20:00:00Z",
    "team1": "Ecuador",
    "team2": "Germany",
    "group": "Group E",
    "venue": "MetLife Stadium, New York/New Jersey"
  },
  {
    "date_text": "Thursday, June 25, 2026",
    "time_utc": "2026-06-25T23:00:00Z",
    "team1": "Japan",
    "team2": "Sweden",
    "group": "Group F",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Thursday, June 25, 2026",
    "time_utc": "2026-06-25T23:00:00Z",
    "team1": "Tunisia",
    "team2": "Netherlands",
    "group": "Group F",
    "venue": "GEHA Field at Arrowhead Stadium, Kansas City"
  },
  {
    "date_text": "Friday, June 26, 2026",
    "time_utc": "2026-06-26T02:00:00Z",
    "team1": "Turkey",
    "team2": "USA",
    "group": "Group D",
    "venue": "SoFi Stadium, Los Angeles"
  },
  {
    "date_text": "Friday, June 26, 2026",
    "time_utc": "2026-06-26T02:00:00Z",
    "team1": "Paraguay",
    "team2": "Australia",
    "group": "Group D",
    "venue": "Levi's Stadium, San Francisco Bay Area"
  },
  {
    "date_text": "Friday, June 26, 2026",
    "time_utc": "2026-06-26T19:00:00Z",
    "team1": "Norway",
    "team2": "France",
    "group": "Group I",
    "venue": "Gillette Stadium, Boston"
  },
  {
    "date_text": "Friday, June 26, 2026",
    "time_utc": "2026-06-26T19:00:00Z",
    "team1": "Senegal",
    "team2": "Iraq",
    "group": "Group I",
    "venue": "BMO Field, Toronto"
  },
  {
    "date_text": "Saturday, June 27, 2026",
    "time_utc": "2026-06-27T00:00:00Z",
    "team1": "Cape Verde",
    "team2": "Saudi Arabia",
    "group": "Group H",
    "venue": "NRG Stadium, Houston"
  },
  {
    "date_text": "Saturday, June 27, 2026",
    "time_utc": "2026-06-27T00:00:00Z",
    "team1": "Uruguay",
    "team2": "Spain",
    "group": "Group H",
    "venue": "Estadio Akron, Guadalajara"
  },
  {
    "date_text": "Saturday, June 27, 2026",
    "time_utc": "2026-06-27T03:00:00Z",
    "team1": "Egypt",
    "team2": "Iran",
    "group": "Group G",
    "venue": "Lumen Field, Seattle"
  },
  {
    "date_text": "Saturday, June 27, 2026",
    "time_utc": "2026-06-27T03:00:00Z",
    "team1": "New Zealand",
    "team2": "Belgium",
    "group": "Group G",
    "venue": "BC Place, Vancouver"
  },
  {
    "date_text": "Saturday, June 27, 2026",
    "time_utc": "2026-06-27T21:00:00Z",
    "team1": "Panama",
    "team2": "England",
    "group": "Group L",
    "venue": "MetLife Stadium, New York/New Jersey"
  },
  {
    "date_text": "Saturday, June 27, 2026",
    "time_utc": "2026-06-27T21:00:00Z",
    "team1": "Croatia",
    "team2": "Ghana",
    "group": "Group L",
    "venue": "Lincoln Financial Field, Philadelphia"
  },
  {
    "date_text": "Saturday, June 27, 2026",
    "time_utc": "2026-06-27T23:30:00Z",
    "team1": "Colombia",
    "team2": "Portugal",
    "group": "Group K",
    "venue": "Hard Rock Stadium, Miami"
  },
  {
    "date_text": "Saturday, June 27, 2026",
    "time_utc": "2026-06-27T23:30:00Z",
    "team1": "DR Congo",
    "team2": "Uzbekistan",
    "group": "Group K",
    "venue": "Mercedes-Benz Stadium, Atlanta"
  },
  {
    "date_text": "Sunday, June 28, 2026",
    "time_utc": "2026-06-28T02:00:00Z",
    "team1": "Algeria",
    "team2": "Austria",
    "group": "Group J",
    "venue": "GEHA Field at Arrowhead Stadium, Kansas City"
  },
  {
    "date_text": "Sunday, June 28, 2026",
    "time_utc": "2026-06-28T02:00:00Z",
    "team1": "Jordan",
    "team2": "Argentina",
    "group": "Group J",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Sunday, June 28, 2026",
    "time_utc": "2026-06-28T19:00:00Z",
    "team1": "2A",
    "team2": "2B",
    "group": "Round of 32",
    "venue": "SoFi Stadium, Los Angeles"
  },
  {
    "date_text": "Monday, June 29, 2026",
    "time_utc": "2026-06-29T17:00:00Z",
    "team1": "1C",
    "team2": "2F",
    "group": "Round of 32",
    "venue": "NRG Stadium, Houston"
  },
  {
    "date_text": "Monday, June 29, 2026",
    "time_utc": "2026-06-29T20:30:00Z",
    "team1": "1E",
    "team2": "3A/B/C/D/F",
    "group": "Round of 32",
    "venue": "Gillette Stadium, Boston"
  },
  {
    "date_text": "Tuesday, June 30, 2026",
    "time_utc": "2026-06-30T01:00:00Z",
    "team1": "1F",
    "team2": "2C",
    "group": "Round of 32",
    "venue": "Estadio BBVA, Monterrey"
  },
  {
    "date_text": "Tuesday, June 30, 2026",
    "time_utc": "2026-06-30T17:00:00Z",
    "team1": "2E",
    "team2": "2I",
    "group": "Round of 32",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Tuesday, June 30, 2026",
    "time_utc": "2026-06-30T21:00:00Z",
    "team1": "1I",
    "team2": "3C/D/F/G/H",
    "group": "Round of 32",
    "venue": "MetLife Stadium, New York/New Jersey"
  },
  {
    "date_text": "Wednesday, July 1, 2026",
    "time_utc": "2026-07-01T01:00:00Z",
    "team1": "1A",
    "team2": "3C/E/F/H/I",
    "group": "Round of 32",
    "venue": "Estadio Azteca, Mexico City"
  },
  {
    "date_text": "Wednesday, July 1, 2026",
    "time_utc": "2026-07-01T16:00:00Z",
    "team1": "1L",
    "team2": "3E/H/I/J/K",
    "group": "Round of 32",
    "venue": "Mercedes-Benz Stadium, Atlanta"
  },
  {
    "date_text": "Wednesday, July 1, 2026",
    "time_utc": "2026-07-01T20:00:00Z",
    "team1": "1G",
    "team2": "3A/E/H/I/J",
    "group": "Round of 32",
    "venue": "Lumen Field, Seattle"
  },
  {
    "date_text": "Thursday, July 2, 2026",
    "time_utc": "2026-07-02T00:00:00Z",
    "team1": "1D",
    "team2": "3B/E/F/I/J",
    "group": "Round of 32",
    "venue": "Levi's Stadium, San Francisco Bay Area"
  },
  {
    "date_text": "Thursday, July 2, 2026",
    "time_utc": "2026-07-02T19:00:00Z",
    "team1": "1H",
    "team2": "2J",
    "group": "Round of 32",
    "venue": "SoFi Stadium, Los Angeles"
  },
  {
    "date_text": "Thursday, July 2, 2026",
    "time_utc": "2026-07-02T23:00:00Z",
    "team1": "2K",
    "team2": "2L",
    "group": "Round of 32",
    "venue": "BMO Field, Toronto"
  },
  {
    "date_text": "Friday, July 3, 2026",
    "time_utc": "2026-07-03T03:00:00Z",
    "team1": "1B",
    "team2": "3E/F/G/I/J",
    "group": "Round of 32",
    "venue": "BC Place, Vancouver"
  },
  {
    "date_text": "Friday, July 3, 2026",
    "time_utc": "2026-07-03T18:00:00Z",
    "team1": "2D",
    "team2": "2G",
    "group": "Round of 32",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Friday, July 3, 2026",
    "time_utc": "2026-07-03T22:00:00Z",
    "team1": "1J",
    "team2": "2H",
    "group": "Round of 32",
    "venue": "Hard Rock Stadium, Miami"
  },
  {
    "date_text": "Saturday, July 4, 2026",
    "time_utc": "2026-07-04T01:30:00Z",
    "team1": "1K",
    "team2": "3D/E/I/J/L",
    "group": "Round of 32",
    "venue": "GEHA Field at Arrowhead Stadium, Kansas City"
  },
  {
    "date_text": "Saturday, July 4, 2026",
    "time_utc": "2026-07-04T17:00:00Z",
    "team1": "W73",
    "team2": "W75",
    "group": "Round of 16",
    "venue": "NRG Stadium, Houston"
  },
  {
    "date_text": "Saturday, July 4, 2026",
    "time_utc": "2026-07-04T21:00:00Z",
    "team1": "W74",
    "team2": "W77",
    "group": "Round of 16",
    "venue": "Lincoln Financial Field, Philadelphia"
  },
  {
    "date_text": "Sunday, July 5, 2026",
    "time_utc": "2026-07-05T20:00:00Z",
    "team1": "W76",
    "team2": "W78",
    "group": "Round of 16",
    "venue": "MetLife Stadium, New York/New Jersey"
  },
  {
    "date_text": "Monday, July 6, 2026",
    "time_utc": "2026-07-06T00:00:00Z",
    "team1": "W79",
    "team2": "W80",
    "group": "Round of 16",
    "venue": "Estadio Azteca, Mexico City"
  },
  {
    "date_text": "Monday, July 6, 2026",
    "time_utc": "2026-07-06T19:00:00Z",
    "team1": "W83",
    "team2": "W84",
    "group": "Round of 16",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Tuesday, July 7, 2026",
    "time_utc": "2026-07-07T00:00:00Z",
    "team1": "W81",
    "team2": "W82",
    "group": "Round of 16",
    "venue": "Lumen Field, Seattle"
  },
  {
    "date_text": "Tuesday, July 7, 2026",
    "time_utc": "2026-07-07T16:00:00Z",
    "team1": "W86",
    "team2": "W88",
    "group": "Round of 16",
    "venue": "Mercedes-Benz Stadium, Atlanta"
  },
  {
    "date_text": "Tuesday, July 7, 2026",
    "time_utc": "2026-07-07T20:00:00Z",
    "team1": "W85",
    "team2": "W87",
    "group": "Round of 16",
    "venue": "BC Place, Vancouver"
  },
  {
    "date_text": "Thursday, July 9, 2026",
    "time_utc": "2026-07-09T20:00:00Z",
    "team1": "W89",
    "team2": "W90",
    "group": "Quarter-finals",
    "venue": "Gillette Stadium, Boston"
  },
  {
    "date_text": "Friday, July 10, 2026",
    "time_utc": "2026-07-10T19:00:00Z",
    "team1": "W93",
    "team2": "W94",
    "group": "Quarter-finals",
    "venue": "SoFi Stadium, Los Angeles"
  },
  {
    "date_text": "Saturday, July 11, 2026",
    "time_utc": "2026-07-11T21:00:00Z",
    "team1": "W91",
    "team2": "W92",
    "group": "Quarter-finals",
    "venue": "Hard Rock Stadium, Miami"
  },
  {
    "date_text": "Sunday, July 12, 2026",
    "time_utc": "2026-07-12T01:00:00Z",
    "team1": "W95",
    "team2": "W96",
    "group": "Quarter-finals",
    "venue": "GEHA Field at Arrowhead Stadium, Kansas City"
  },
  {
    "date_text": "Tuesday, July 14, 2026",
    "time_utc": "2026-07-14T19:00:00Z",
    "team1": "W97",
    "team2": "W98",
    "group": "Semi-finals",
    "venue": "AT&T Stadium, Dallas"
  },
  {
    "date_text": "Wednesday, July 15, 2026",
    "time_utc": "2026-07-15T19:00:00Z",
    "team1": "W99",
    "team2": "W100",
    "group": "Semi-finals",
    "venue": "Mercedes-Benz Stadium, Atlanta"
  },
  {
    "date_text": "Saturday, July 18, 2026",
    "time_utc": "2026-07-18T21:00:00Z",
    "team1": "L101",
    "team2": "L102",
    "group": "Third-place play-off",
    "venue": "Hard Rock Stadium, Miami"
  },
  {
    "date_text": "Sunday, July 19, 2026",
    "time_utc": "2026-07-19T19:00:00Z",
    "team1": "W101",
    "team2": "W102",
    "group": "Final",
    "venue": "MetLife Stadium, New York/New Jersey"
  }
];
