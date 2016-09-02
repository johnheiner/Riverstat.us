Water need to get:
 - Flow Rate
 - Depth
 - Water Temperature
 - Water depth forecast (4ft 'and rising/falling')

http://waterservices.usgs.gov/rest/IV-Test-Tool.html

http://waterservices.usgs.gov/nwis/iv/?format=json&indent=on&sites=02037500&parameterCd=00021,00011,00055,00065
http://waterservices.usgs.gov/nwis/iv/?format=json&indent=on&sites=02037500&parameterCd=00065,00060,00010
http://waterservices.usgs.gov/nwis/dv/?format=json&indent=on&sites=02037500&parameterCd=00065,00060,00010

Weather need to get:
 - Current Air Temperature
 - Forecast for the day
 - https://api.forecast.io/forecast/2fa348183757f6374b46cf6bc670dc92/37.5632022,-77.5469314
 - login: heiner.john@gmail.com pw: riverstat.us

Overall need:
 - Time last updated (need to account for Daylight savings time)
