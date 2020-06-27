'use strict';
const express = require('express'); // app server
const bodyParser = require('body-parser'); // parser for post requests
const PersonalityInsightsV3 = require('ibm-watson/personality-insights/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');
var mongoose = require('mongoose');
var Personality = require('./models/personality');
var Tone = require('./models/tones');
var tone_analysis;
var personality_analysis;
var port = 8080;
const url = 'mongodb://127.0.0.1:27018/getJobs'
mongoose.connect(url, { useNewUrlParser: true })
const app = express();
// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

const personalityInsights = new PersonalityInsightsV3({
  authenticator: new IamAuthenticator({ apikey: '<apikey>' }),
  version: '2020-06-23',
  url: '<url>'
});

const toneAnalyzer = new ToneAnalyzerV3({
    authenticator: new IamAuthenticator({ apikey: '<apikey>' }),
    version: '2020-05-29',
    url: '<url>'
});
app.post('/ta', function (req, res) {
    var text= req.body.text;
    console.log("in the function");
    if(text === ""){
        console.log("Empty string");
    }else{
        toneAnalyzer.tone(
            {
            toneInput: { 'text': text },
            //contentType: 'text/plain',
            contentType: 'application/json'
            })
            .then(response => {
            console.log("in TA");
            console.log(JSON.stringify(response.result.document_tone, null, 2));
            tone_analysis = response.result;
            var newTone = new Tone();
            newTone.text = text;
            var tones = tone_analysis.document_tone.tones ;
            for (var i =0; i< tones.length ;i++) {
                var name= tones[i].tone_name;
                console.log(name);
                console.log(tones[i].score);
                if(name === "Anger"){
                    newTone.anger = tones[i].score;
                }else if(name === "Fear"){
                    newTone.fear = tones[i].score;
                }else if(name === "Joy"){
                    newTone.joy = tones[i].score;
                }else if(name === "Tentative"){
                    newTone.tentative =tones[i].score;
                }
                else if(name === "Sadness"){
                    newTone.sadness = tones[i].score;
                }
                else if(name === "Analytical"){
                    newTone.analytical = tones[i].score;
                }
                else{//Confident
                    newTone.confident = tones[i].score;
                }
            }    
            newTone.save(function(err, tone) {
            if(err) {
            res.send('error saving tone entry');
            } else {
            console.log(tone);
            res.send(tone);
            }
            });
            })
            .catch(err => {
            console.log(err);
            });
    }
})
app.post('/pa', function (req, res) {
    var Personality_text= req.body.text;
    if(countWords(Personality_text) < 100){
        console.log("Less words");
    }else{
        personalityInsights.profile(
            	{
            	content: Personality_text,
            	contentType: 'text/plain',
            	consumptionPreferences: true
            	})
            	.then(response => {
                console.log("in the PA");
                console.log(JSON.stringify(response.result, null, 2));
                personality_analysis = response.result;
                var newPersonality = new Personality();
                newPersonality.wholeText = Personality_text;
                var traits = personality_analysis.personality ;
                for (var i =0; i< traits.length ;i++) {
                    console.log(traits[i].name);
                    var name= traits[i].name;
                    console.log(name);
                    console.log(traits[i].percentile);
                    if(name === "Openness"){
                        newPersonality.openness = traits[i].percentile;
                    }else if(name === "Conscientiousness"){
                        newPersonality.conscientiousness = traits[i].percentile;
                    }else if(name === "Extraversion"){
                        newPersonality.extraversion = traits[i].percentile;
                    }else if(name === "Agreeableness"){
                        newPersonality.agreeableness = traits[i].percentile;
                    }else{
                        newPersonality.neuroticism = traits[i].percentile;
                    }
                }    
                newPersonality.save(function(err, personality) {
                if(err) {
                res.send('error saving personality entry');
                } else {
                console.log(personality);
                res.send(personality);
                }
                });
            	})
            	.catch(err => {
            	console.log('error: ', err);
                });
        
    }
})
function countWords(str) {
    str = str.replace(/(^\s*)|(\s*$)/gi,"");
    str = str.replace(/[ ]{2,}/gi," ");
    str = str.replace(/\n /,"\n");
    return str.split(' ').length;
    }
module.exports = app;