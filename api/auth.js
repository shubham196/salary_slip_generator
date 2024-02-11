/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var cors = require('cors');  // Import the cors middleware
const authProvider = require('../auth/AuthProvider');

const { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('../authConfig');

const router = express.Router();
// Apply cors middleware
router.use(cors());

router.get('/signin', authProvider.login({
    scopes: [],
    redirectUri: REDIRECT_URI,
    successRedirect: '/'
}));

router.get('/acquireToken', authProvider.acquireToken({
    scopes: ['User.Read','Calendars.Read','Calendars.ReadBasic'
    ,'offline_access','Calendars.ReadWrite'],
    redirectUri: REDIRECT_URI,
    successRedirect: '/users/profile'
}));

router.get('/acquireToken2', authProvider.acquireToken({
    scopes: ['User.Read','Calendars.Read','Calendars.ReadBasic'
    ,'offline_access','Calendars.ReadWrite'],
    redirectUri: REDIRECT_URI,
    successRedirect: '/users/calendar' // Change the successRedirect to the calendar route
}));

router.get('/calendarList', (req, res, next) => {
    authProvider.acquireToken({
        scopes: ['User.Read', 'Calendars.Read', 'Calendars.ReadBasic', 'offline_access', 'Calendars.ReadWrite', 'Calendars.Read.Shared'],
        redirectUri: REDIRECT_URI,
        successRedirect: '/users/calendars' // Change the successRedirect to the calendar route
    })(req, res, err => {
        if (err) {
            // Handle the error here
            console.error('Error in acquiring token:', err);
            return res.status(500).json({ error: 'Failed to acquire token' });
        }
        // Token acquired successfully, redirect logic is handled by authProvider
        // You may not need to add anything here unless you have specific post-acquisition logic.
    });
});
router.get('/stopInterval', authProvider.acquireToken({
    scopes: ['User.Read','Calendars.Read','Calendars.ReadBasic'
    ,'offline_access','Calendars.ReadWrite'],
    redirectUri: REDIRECT_URI,
    
    // successRedirect: '/users/stopInterval' // Change the successRedirect to the calendar route
}));
router.post('/redirect', authProvider.handleRedirect());

router.get('/signout', authProvider.acquireToken({
    scopes: ['User.Read','Calendars.Read','Calendars.ReadBasic'
    ,'offline_access','Calendars.ReadWrite'],
    redirectUri: REDIRECT_URI,
    successRedirect: '/users/signout'
}));

// router.get('/signout', authProvider.logout({
//     clearInterval();
//     postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
// }));

module.exports = router;
