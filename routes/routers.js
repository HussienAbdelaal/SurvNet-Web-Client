/**
 * @author Omar Ihab Handouk
 * @exports ROUTER
 * @description This file is used to handle HTTP Requests (Creation-Read-Update-Delete 'aka' CRUD) for different paths 
 */

//Modules

const express = require('express'); // Minimalist Framework for NodeJS
const request = require('request'); // Used for HTTP Calls
const DNT = require('date-and-time'); // Used for adding Time and Date for (Create-Update) operations

const ROUTER = express.Router(); //Router for different Paths {index, report, inquire, update, remove}

const LOGGER = console; // Standard console for logging, TODO: Replace with either Morgan, Simple-Node-Logger or Watson

//Cloudant Credentials TODO: Needs to be replaced with enviroment variable in Cloud at deployment
const username = '3d878a23-6ab2-467d-b2b4-9132c92052d2-bluemix';
const password = '0728007196494aac5361e9b13d772927987a7a41d0430c536583029fc0a21530';

//<---------Index Router--------->
/**
 * @description HTTP GET Request to Render index.ejs
 */
ROUTER.get('/', (req, response, next) => { // eslint-disable-line
    response.render('index', {
        Directory: 'Index'
    });
});
//<------------------------------->

//<---------Report Router--------->
/**
 * @description HTTP GET Request to Render report.ejs
 */
ROUTER.get('/report', (req, response, next) => { // eslint-disable-line
    response.render('report', {
        Directory: "Report", // eslint-disable-line
        requestStatus: null,
        requestID: null,
        revision: null,
        error: null
    });
});

/**
 * @description HTTP POST Request used to fetch form information from report.ejs and use Cloudant RESTful APIs to create an incident document within a database
 */
ROUTER.post('/report', (req, response, next) => { // eslint-disable-line

    let form = req.body;

    let now = new Date(); // Date and Time of Report

    let currDate = DNT.format(now, 'YYYY/MM/DD');
    let currTime = DNT.format(now, 'hh:mm A [GMT]Z');

    form.Date = currDate;
    form.Time = currTime;

    form.Status = 'Reported/Pending Check'; // Current Incident Status

    if (form.Longitude == '' || form.Latitude == '') {
        form.Longitude = 'undefined';
        form.Latitude = 'undefined';
    }

    let options = {
        method: 'POST',
        url: `https://${username}:${password}@3d878a23-6ab2-467d-b2b4-9132c92052d2-bluemix.cloudant.com/test_dir_1`,
        headers: {
            "Content-Type": "application/json" // eslint-disable-line
        },
        json: form
    };

    request(options, (error, res, body) => {

        if (error) {
            response.render('report', {
                Directory: "Report", // eslint-disable-line
                requestStatus: null,
                requestID: null,
                revision: null,
                error: "Error: " + error // eslint-disable-line
            });
        } else {

            let status = body;

            if (status.ok == 'error') {
                response.render('report', {
                    Directory: "Report", // eslint-disable-line
                    requestStatus: null,
                    requestID: null,
                    revision: null,
                    error: "Error: " + error // eslint-disable-line
                });
            } else {
                response.render('report', {
                    Directory: "Report", // eslint-disable-line
                    requestStatus: status.ok,
                    requestID: status.id,
                    revision: status.rev,
                    error: null
                });
            }
        }
    });

    let TransactionID = parseInt((Math.random() * 100000));

    let Transaction = {
        "$class": "net.biz.disasterSampleNetwork.CreateDisaster", // eslint-disable-line
        "Id": String(form.Country) + "_" + TransactionID, // eslint-disable-line
        "location": String(form.Country), // eslint-disable-line
        "disasterType": String(form.Disaster), // eslint-disable-line
    };

    LOGGER.log(Transaction);

    let Blockchain = {
        uri: 'https://disaster-rest-forgiving-hippopotamus.eu-gb.mybluemix.net/api/CreateDisaster',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        json: Transaction
    };

    request(Blockchain, (error, res, body) => {
        if (error) {
            LOGGER.log('E: ' + error);
        } else {
            let status = body;

            if (error) {
                LOGGER.log(error);
            } else {
                LOGGER.log('Success: ' + JSON.stringify(status));
            }
        }
    });
});
//<------------------------------->

//<---------Inquire Router--------->
/**
 * @description HTTP GET Request used Both to Render inquire.ejs and fetch form information containing an ID for the JSON document a user would like to retrieve from a database
 */
ROUTER.get('/inquire', (req, response, next) => { // eslint-disable-line

    let form = req.query;

    if (form.reportID == undefined) {
        response.render('inquire', {
            Directory: "Inquire", // eslint-disable-line
            Country: null,
            City: null,
            Longitude: null,
            Latitude: null,
            Disaster: null,
            ID: null,
            Date: null,
            Time: null,
            Status: null,
            Revision: null,
            error: null // eslint-disable-line
        });
    } else {

        let docID = form.reportID;

        let options = {
            method: "GET", // eslint-disable-line
            url: `https://${username}:${password}@3d878a23-6ab2-467d-b2b4-9132c92052d2-bluemix.cloudant.com/test_dir_1/` + docID,
            headers: {
                "Content-Type": "application/json" // eslint-disable-line
            }
        };

        request(options, (error, res, body) => {

            if (error) {
                response.render('inquire', {
                    Directory: "Inquire", // eslint-disable-line
                    Country: null,
                    City: null,
                    Longitude: null,
                    Latitude: null,
                    Disaster: null,
                    ID: null,
                    Date: null,
                    Time: null,
                    Status: null,
                    Revision: null,
                    error: "Error: " + error // eslint-disable-line
                });
            } else {
                let status = JSON.parse(body); // IMPORTANT: Cloudant returns document as string, parse to JSON

                if (status.error != undefined) // error handler_2
                {
                    response.render('inquire', {
                        Directory: "Inquire", // eslint-disable-line
                        Country: null,
                        City: null,
                        Longitude: null,
                        Latitude: null,
                        Disaster: null,
                        ID: null,
                        Date: null,
                        Time: null,
                        Status: null,
                        Revision: null,
                        error: "Error: " + error // eslint-disable-line
                    });
                } else {
                    response.render('inquire', {
                        Directory: "Inquire", // eslint-disable-line
                        Country: status.Country,
                        City: status.City,
                        Longitude: status.Longitude,
                        Latitude: status.Latitude,
                        Disaster: status.Disaster,
                        ID: status._id,
                        Date: status.Date,
                        Time: status.Time,
                        Status: status.Status,
                        Revision: status._rev,
                        error: null // eslint-disable-line
                    });
                }
            }
        });
    }
});
//<------------------------------->

//<---------Update Router--------->
/**
 * @description HTTP GET Request used to Render update.ejs
 */
ROUTER.get('/update', (req, response, next) => { // eslint-disable-line
    response.render('update', {
        Directory: "Update", // eslint-disable-line
        OK: null,
        ID: null,
        Revision: null,
        Error: null
    });
});

/**
 * @description HTTP PUT Request used to fetch form data in update.ejs which contains the document's ID, A Promise is used to return the Revision ID of the Document first (GET Request is issued to return a JSON Document matching the ID submitted by the user) then the resolution containing the Revision Number is passed to a PUT request for the document's update
 */
ROUTER.put('/update', (req, response, next) => { // eslint-disable-line

    let form = req.body;

    let requestID = form.reportID;

    delete req.body._method;
    delete req.body.reportID;

    let now = new Date();
    let currDate = DNT.format(now, 'YYYY/MM/DD');
    let currTime = DNT.format(now, 'hh:mm A [GMT]Z');

    let requestURL = `https://${username}:${password}@3d878a23-6ab2-467d-b2b4-9132c92052d2-bluemix.cloudant.com/test_dir_1/` + requestID;

    // Promise used to return Revision ID
    let getRevision = new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: requestURL,
            headers: {
                "Content-Type": "application/json" // eslint-disable-line
            }
        }, (error, response, body) => {
            if (error) {
                reject('Error: ' + error);
            } else {

                let status = JSON.parse(body);

                if (status.error != undefined) {
                    reject('Error: ' + error);
                } else {
                    resolve(status);
                }
            }
        });
    });

    getRevision.then((Incident) => {

        let revisionID = Incident._rev;

        Incident.Date = currDate;
        Incident.Time = currTime;
        Incident.Status = form.Status;

        LOGGER.log(Incident.status);

        let options = {
            method: "PUT", // eslint-disable-line
            headers: {
                "Content-Type": "application/json" // eslint-disable-line
            }, // eslint-disable-line
            json: Incident,
            url: requestURL + `?rev=${revisionID}` // eslint-disable-line
        };

        request(options, (error, res, body) => {

            if (error) {
                response.render('update', {
                    Directory: "Update", // eslint-disable-line
                    OK: null,
                    ID: null,
                    Revision: null,
                    Error: error
                });
            } else {

                let status = body;

                if (status.error != undefined) {
                    response.render('update', {
                        Directory: "Update", // eslint-disable-line
                        OK: null,
                        ID: null,
                        Revision: null,
                        Error: error
                    });
                } else {
                    response.render('update', {
                        Directory: "Update", // eslint-disable-line
                        OK: status.ok,
                        ID: status.id,
                        Revision: status.rev,
                        Error: null
                    });
                }
            }
        });
    }).catch((Error) => {
        response.render('update', {
            Directory: "Update", // eslint-disable-line
            OK: null,
            ID: null,
            Revision: null,
            Error: Error
        });
    });
});
//<------------------------------->

//<---------Remove Router--------->
/**
 * @description HTTP GET Request for remove.ejs
 */
ROUTER.get('/remove', (req, response, next) => { // eslint-disable-line
    response.render('remove', {
        Directory: "Remove", // eslint-disable-line
        ID: null,
        OK: null,
        Revision: null,
        Error: null
    });
});

/**
 * FIXME: Document is deleted but error still exist, use a LOGGER to check for this
 * @description HTTP DELETE Request Used to fetch form data from remove.ejs which contains Document ID, A Promise is then used to retrieve a Document Revision number which is passed to the HTTP DELETE Request for the document deletion
 */
ROUTER.delete('/remove', (req, response, next) => { // eslint-disable-line
    let form = req.body;

    let requestURL = `https://${username}:${password}@3d878a23-6ab2-467d-b2b4-9132c92052d2-bluemix.cloudant.com/test_dir_1/` + form.requestID;

    // Promise used to return document Revision Number
    let getRevision = new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: requestURL,
            headers: {
                "Content-Type": "application/json" // eslint-disable-line
            }
        }, (error, response, body) => {
            if (error) {
                reject('Error: ' + error);
            } else {

                let status = JSON.parse(body);

                if (status.error != undefined) {
                    reject('Error: ' + error);
                } else {
                    resolve(status._rev);
                }
            }
        });
    });

    getRevision.then((revision) => {
        let options = {
            method: "DELETE", // eslint-disable-line
            url: requestURL + `?rev=${revision}`,
            headers: {
                "Content-Type": "application/json" // eslint-disable-line
            }
        };

        request(options, (error, res, body) => {
            if (error) {
                response.render('remove', {
                    Directory: "Remove", // eslint-disable-line
                    ID: null,
                    OK: null,
                    Revision: null,
                    Error: error
                });
            } else {

                let status = JSON.parse(body);

                if (status.ok == 'error') {
                    response.render('remove', {
                        Directory: "Remove", // eslint-disable-line
                        ID: null,
                        OK: null,
                        Revision: null,
                        Error: error
                    });
                } else {
                    response.render('remove', {
                        Directory: "Remove", // eslint-disable-line
                        ID: status.id,
                        OK: status.ok,
                        Revision: status.rev,
                        Error: null
                    });
                }
            }
        });
    }).catch((error) => {
        response.render('remove', {
            Directory: "Remove", // eslint-disable-line
            ID: null,
            OK: null,
            Revision: null,
            Error: error
        });
    });
});
//<------------------------------->

//<---------Send Supplies--------->
ROUTER.get('/send', (req, response, next) => { // eslint-disable-line
    response.render('send', {
        Directory: "Send Supplies", // eslint-disable-line
        Status: null,
        Error: null
    });
});

ROUTER.post('/send', (req, response, next) => { // eslint-disable-line
    LOGGER.log('HERE');
    let form = req.body;
    let Transaction = {
        "$class": "net.biz.disasterSampleNetwork.SendSupply", // eslint-disable-line
        "supply": form.supply, // eslint-disable-line
        "receiver": form.receiver, // eslint-disable-line
        "deviceId": form.deviceId, // eslint-disable-line
        "route": form.route, // eslint-disable-line
        "amount": form.amount, // eslint-disable-line
    };

    let Blockchain = {
        uri: 'https://disaster-rest-forgiving-hippopotamus.eu-gb.mybluemix.net/api/SendSupply',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        json: Transaction
    };

    request(Blockchain, (error, res, body) => {

        if (error) {
            response.render('send', {
                Directory: "Send Supplies", // eslint-disable-line
                Status: null,
                Error: error
            });
        } else {
            let status = body;

            if (error || status.error) {
                response.render('send', {
                    Directory: "Send Supplies", // eslint-disable-line
                    Status: null,
                    Error: JSON.stringify(status.error)
                });
            } else {
                response.render('send', {
                    Directory: "Send Supplies",
                    Status: "Request Completed",
                    Error: null
                });
            }
        }

    });
});
//<------------------------------->

//<---------Receive Supplies--------->
ROUTER.get('/receive', (req, response, next) => { // eslint-disable-line
    response.render('receive', {
        Directory: "Verify Receival", // eslint-disable-line
        Status: null,
        Error: null
    });
});

ROUTER.post('/receive', (req, response, next) => { // eslint-disable-line

    let form = req.body;

    let Transaction = {
        "$class": "net.biz.disasterSampleNetwork.SupplyReceived", // eslint-disable-line
        "receiver": form.receiver, // eslint-disable-line
        "supply": form.supply, // eslint-disable-line
        "disaster": form.disaster // eslint-disable-line
    };

    let Blockchain = {
        uri: 'https://disaster-rest-forgiving-hippopotamus.eu-gb.mybluemix.net/api/SupplyReceived', // eslint-disable-line
        method: 'POST', // eslint-disable-line
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        json: Transaction
    };

    request(Blockchain, (error, res, body) => {
        if (error)
        {
            response.render('receive', {
                Directory: "Verify Receival", // eslint-disable-line
                Status: null,
                Error: error
            });
        }
        else
        {
            let status = body;

            if (error || status.error)
            {
                response.render('receive', {
                    Directory: "Verify Receival", // eslint-disable-line
                    Status: null,
                    Error: JSON.stringify(status.error)
                });
            }
            else
            {
                response.render('receive', {
                    Directory: "Verify Receival", // eslint-disable-line
                    Status: "Request Verified",
                    Error: null
                });
            }
        }
    });
});
//<------------------------------->
module.exports = ROUTER;