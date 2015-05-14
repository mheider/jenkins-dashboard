var blessed = require('blessed');
var contrib = require('blessed-contrib');
var _ = require('lodash');
var moment = require('moment');

var jenkinsUrl = process.env.JENKINS_URL || 'YOUR_JENKINS_SERVER';
jenkinsUrl = 'http://' + jenkinsUrl;

var jobsFilterRegex = new RegExp(process.env.JOBS_FILTER, 'i');

var jenkins = require('jenkins')(jenkinsUrl);

var screen = blessed.screen();

var grid = new contrib.grid({rows: 13, cols: 12, screen: screen})

var defaultStyle = { fg: 'white', bg: 'black', border: { fg: '#f0f0f0' } };

var addJobToGrid = function (job, grid, x, y, w, h) {

	var box = grid.set(x, y, w, h, blessed.box, { content: job.name, style: defaultStyle } );
	box.style.bg = job.color.split('_')[0];

	if(job.color.split('_')[1] === 'anime') {

		setTimeout(function() {
			box.style.bg = '#999999';
			box.style.fg = 'black';
			screen.render();
		}, 1000);

	}

};

var drawGrid = function (buildStatus, callback) {

	var box = grid.set(0, 4, 4, 4, blessed.box, { content: moment().format('YYYY-MM-DD HH:mm:ss'), style: defaultStyle } );

	addJobToGrid(buildStatus[0], grid, 1, 0, 6, 4);
	addJobToGrid(buildStatus[1], grid, 1, 4, 6, 4);
	addJobToGrid(buildStatus[2], grid, 1, 8, 6, 4);
	addJobToGrid(buildStatus[3], grid, 7, 0, 6, 4);
	addJobToGrid(buildStatus[4], grid, 7, 4, 6, 4);
	addJobToGrid(buildStatus[5], grid, 7, 8, 6, 4);

	screen.render();

	setTimeout(function() {
		return callback(drawGrid);
	}, 2000)
};

var filterJobs = function (jobs) {
	return _.filter(jobs, function (job) {
		return job.name.match(jobsFilterRegex);
	});
};

var getJenkinsStatus = function (callback) {
	jenkins.info(function(err, data) {
		 if (err) {
			console.log(err);
		 }

		 return callback(_.sortBy(filterJobs(data.jobs), 'name'), getJenkinsStatus);
	});
};

getJenkinsStatus(drawGrid)