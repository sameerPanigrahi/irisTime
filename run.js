/*jshint esversion: 6 */
'use strict';

const express = require('express');
var server = express();
var request = require('superagent');
var intent = 'time';
const api_key = 'AIzaSyB0Cu8XpcrTOYNc6Deu75S4dmDKhqPxEOk';

var announce = function(port){
	var url = `localhost:3000/time/${port}`;
	console.log(url);
	request.get(url).end((err, success)=>{
		if(err){
			console.log(`error while registering the service, details -> \n ${err}`);
		}else{
			console.log(success.body.successMessage);
		}
	});
};

var app = server.listen(()=>{
	console.log(`time service listening on port ${app.address().port}`);
	announce(`${app.address().port}`);
});

function getTimeFromGeoCodes(geo_codes, res){
	var lat = geo_codes.lat;
	var lng = geo_codes.lng;
	var moment = require('moment');
	var currentTimestamp = moment().unix();
	var request = require('superagent');

	request.get('https://maps.googleapis.com/maps/api/timezone/json').
	query({location:`${lat},${lng}`}).
	query({timestamp:currentTimestamp}).
	query({key:api_key}).
	end((err, response)=>{
		if(err){
			console.log(`google api time error -> ${err}`);
		}
		else{
			var time = currentTimestamp + response.body.dstOffset + response.body.rawOffset;
			var date = 'Time is: ' + new Date(time*1000).toISOString();
			console.log(date);
			res.send({d : date});
		}
	});
}

server.get('/:location', function(req, res){
	
	
	var location = req.params.location;
	console.log(location);

	var request = require('superagent');
	request.get('https://maps.googleapis.com/maps/api/geocode/json').query({address:location}).query({key:api_key}).end((err, response)=>{
		if(err){
			console.log(`google api geo_code error -> ${err}`);
		}
		else{
			var geo_codes = response.body.results[0].geometry.location;
			var time = getTimeFromGeoCodes(geo_codes, res);
		}
	});
});