const input = process.argv.slice(2);
var repoOwner = input[0];
var repoName = input[1];

// fs, request and dotenv node module files are needed for Github access
const fs = require("fs");
const request = require('request');
require('dotenv').config();

// Make sure you have your .env file in your local repo
// with DB_HOST = LocalHost; DB_USER = <Github_Username>; DB_PASS = <GitHub_Password>
// Link https://www.npmjs.com/package/dotenv
const GITHUB_USER = process.env.DB_USER;
const GITHUB_TOKEN = process.env.DB_PASS;

const folderPath = "avatars/";

// Make new Folder 'avatar' and handles error if it exists
var mkdirSync = function() {
  try {
    fs.mkdirSync("avatars");
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }
};

// This function will utilize the user and token fron dotenv to get info from GitHub
// via repoOwner and repoName with cb as a callback for error checking
function getRepoContributors(repoOwner, repoName, cb) {

  var requestOptions = {
    url: 'https://' + GITHUB_USER + ':' + GITHUB_TOKEN +
      '@api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors',
    headers: {
      "User-Agent": "GitHub Avatar Downloader - Student Project"
    }
  };
  // Request for information from github
  request.get(requestOptions, cb);

}

// from getRepoContributors to downloadImageUrl the image url is checked
// for which error reponse recieved (should be 200) then pipe the url to create the image
// within the filepath
function downloadImageByUrl(url, filePath) {
  request.get(url)
    .on('error', function(err) {
      throw console.log('Well, that didnt\' work', err);
    })
    .on('response', function(response) {
      console.log('Response Status Code: ', response.statusCode);
    })
    .pipe(fs.createWriteStream(filePath));

}

//  From the get requestOptions in getRepoContributors to the anonymous function
//  the result is JSON parsed for each item in resultObj to give avatar url and folderpath to send pic to
getRepoContributors(repoOwner, repoName, function(err, result) {
  console.log("Errors:", err);
  var resultObj = JSON.parse(result.body);
  resultObj.forEach((item) => downloadImageByUrl(item.avatar_url,
    folderPath + item.login + '.jpg'));
});