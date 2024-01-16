/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var router = express.Router();

var fetch = require('../fetch');

var { GRAPH_ME_ENDPOINT } = require('../authConfig'); // Assuming you have GRAPH_CALENDAR_ENDPOINT defined in authConfig

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }
    next();
};

router.get('/id',
    isAuthenticated, // check if user is authenticated
    async function (req, res, next) {
        res.render('id', { idTokenClaims: req.session.account.idTokenClaims });
    }
);

router.get('/profile',
    isAuthenticated, // check if the user is authenticated
    async function (req, res, next) {
        try {
            const data = await fetchGraphData(GRAPH_ME_ENDPOINT, req.session.accessToken);
            // console.log("GraphResponse", data.value[0].subject);
            // Render the profile template with the graphResponse data
            res.json({ data: data});
        } catch (error) {
            next(error);
        }
    }
);
async function fetchGraphData(endpoint, accessToken) {
    try {
        const response = await fetch(endpoint, accessToken);
        // Assuming the response structure, adjust accordingly
        // const data = await response.json();
        return response;
    } catch (error) {
        throw error;
    }
}

module.exports = router;
