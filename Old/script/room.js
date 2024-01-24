var app = angular.module('meetingApp', ["exchange","idle",'angularCSS','asLogger']);

//sanitize to be able to display in chrome extension
app.config(['$compileProvider',function( $compileProvider ){   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|filesystem|filesystem:chrome-extension|file):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|filesystem|filesystem:chrome-extension|file):/);
}]);

app.controller('meetingCtrl', ["$scope","$http","$interval","$timeout","$q","exchangeFactory","idleFactory","logFactory","$rootScope",function ($scope, $http, $interval, $timeout, $q, exchange, idle, logFactory, $rootScope) {
    var SLOT_RESTRICT = 120;
    var CLOCK_REFRESH = 2;
    var LOAD_REFRESH = 60;
    var ROOM_RETRY = 10;

    var CONST_GREEN = "green"
    var CONST_RED = "red"
    var CONST_GREENCODE = "#008000"
    var CONST_REDCODE = "#FF0000"
    
    var roomThread;
    var dataThread;
    var updateThread;
    var roomTimer = null;
    var tapTimer = null;
    var loadingTimer = null;
    
    var firstRun = true;
    var wentOffline = false;
    var customTimeout = true;

    var sTimeObj;
    var eTimeObj;

    var startedKeyCapture = false;
    var capturedText = "";

    var storage = {
        setItem : function(key,value) {
            
        },
        getItem : function(key) {
            return null;
        }
    };

    var token = null;

    $scope.sTime;
    $scope.eTime;
    $scope.clock = moment().format("h:mm a");
    $scope.dateDisplay = moment().format("dddd, D MMM YYYY");
    $scope.room = {};
    $scope.event = {};
    $scope.result = null;
    $scope.remaining = null;
    $scope.date = "";
    $scope.showOverlay = false;
    $scope.background = {};
    $scope.logo = "";
    $scope.canCancelEvent = false;
    $scope.online = true;
    $scope.idle = false;
    //$scope.audio = false;
    $scope.isLoading = false;
    $scope.tapped=false;
    $scope.range = true;
    $scope.justBooked = false;
    $scope.selectMessage="Room booking slots";
    $scope.onYesCallback = function(){};
    $scope.onNoCallback = function(){};
    $scope.dnd = false;
    $scope.dndActive = false;
    $scope.offlinePassive = false;
    $scope.showAuth = false;
    $scope.isCard = false;
    $scope.cardMode = 0;
    $scope.cardPicture = { "background-image": "url(./img/card.png)"};
    $scope.cardMessage = "Swipe your card at the card reader";
    $scope.dialogTop = "";
    $scope.dialogBottom = "Comfirm?";
    $scope.extendEvent = "";
    $scope.currentlightstatus ="";
    $scope.canExtend =false;
    

    //$scope.$storage = $localStorage.$default({
    //    eventId: null,
    //    started: null
    //});

    var process = { action: null, param: null, user: null };

    $scope.screenSaverMode =
    {
        "enabled":true,
        "mode":"bounce",
        "duration":3 * 60 * 1000
    };
    
    $scope.deferCancel = false;
    $scope.mustStart = false;
    $scope.currentStarted = false;
    $scope.lastAvailableTimestamp = moment().toISOString();
    $scope.isUpcomingToday = false;
    
    var scope=this;
    scope.modelObj={};
    scope.prevModel={"roomId" : "" , baseUrl : ""};
    
    var loading = false;
    var booking = false;
    var atEvent = false;
    var connecting = false;
    var searching = false;
    var canceling = false;
    var altering = false;
    var extending = false;
    var marking = false;
    var currentlyBooking = false;
    var atExtend = false;
    
    var hasRegistered = false;
    var hasInitialized = false;

    $scope.rangeStart = -1;
    $scope.rangeEnd = -1;
    $scope.page = 0;
    $scope.copy=[];

    var _autoLogin = false;

    //initialize animations
    $.Velocity.RegisterEffect("slideIn", {
        defaultDuration: 500,
        calls: [
            ['transition.slideLeftBigIn', 1.0, { easing: "easeOutExpo" }]
        ]
    });

    $.Velocity.RegisterEffect("slideOut", {
        defaultDuration: 500,
        calls: [
            ['transition.slideRightBigOut', 1.0, { easing: "easeOutExpo" }]
        ]
    });

    jQuery.fn.redraw = function() {
        var curDisplay = this.css('display');
        this.css('display', 'none'); 
        var temp = this[0].offsetHeight;
        this.css('display', curDisplay);
        temp = this[0].offsetHeight;
    };

    var redraw = setInterval(function(){
        $('body').redraw();
    },60 * 60 * 1000);

    var animPriority = ["slideIn", "slideOut"];
    var activeSelectors = {};

    function SlideIn(selector) {
        AnimateOnce(selector, "slideIn");
    }

    function SlideOut(selector) {
        AnimateOnce(selector, "slideOut");
    }

    function AnimateOnce(selector, anim) {
        if (activeSelectors[selector] == null || animPriority.indexOf(anim) < animPriority.indexOf(activeSelectors[selector])) {
            activeSelectors[selector] = anim;
            $(selector).velocity(anim, {
                complete: function () {
                    delete activeSelectors[selector];
                }
            });
        }
    }

    //update tooltips for facilities
    $scope.$watch( function() {
        if (hasRegistered) 
            return;
        
        hasRegistered = true;

        $scope.$$postDigest( function() {
            hasRegistered = false;
            
            $('.tooltip:not(.tooltipstered)').tooltipster({
                contentCloning : true,
                trigger: 'click'
            });
        });
    });

    //used in simple mode to detect tap to display action buttons
    $scope.triggerTap = function ()
    {
        $timeout(function(){
            if ($scope.isCurrent() && atEvent && $scope.idle==false && ($scope.online == true || !$scope.offlinePassive))
            {
                $scope.tapped=true;
                $timeout.cancel(tapTimer);
                tapTimer = $timeout(function(){
                    $scope.tapped=false;
                },15000)
            }
        });
    };

    var checkUser = function (action, userId, employeeId) {
        var deferred = $q.defer();

        if (_autoLogin) {
            console.log("Auto Login");

            deferred.resolve({ auto: true });
        }
        else {
            if (userId != null && employeeId != null && userId != undefined && employeeId != undefined) {
                console.log("Login Authentication");

                exchange.validUser(scope.modelObj.server, userId, employeeId).then(
                    function successCallback (response) {
                        if (action == "book") {
                            deferred.resolve({ auto: false, id: response.id, email: response.email });
                        }
                        else {
                            if (response.email == $scope.event.currentEvent.organiser.email) {
                                deferred.resolve({ auto: false, id: response.id, email: response.email });
                            }
                            else {
                                deferred.reject({ status: "ERROR", message: "User is not an organiser." });                                
                            }
                        } 
                    },
                    function errorCallback(response) {
                        console.log(response);

                        deferred.reject({ status: "ERROR", message: "Authenticaion failed. Please try again." });
                    }
                );
            }
            else {
                deferred.reject({ status: "ERROR", message: "No authentication parameters found." });
            }
        }

        return deferred.promise;
    };

    $scope.processRequest = function (proceed) {
        if (proceed) {
            $timeout($scope.hideAuth, 1500);

            checkUser(process.action, process.user.uid, process.user.pwd).then(
                function successCallback(response) {
                    console.log(response);

                    switch(process.action) {
                        case "book":
                            if (!response.auto) {
                                $scope.bookEvent(process.param.start, process.param.end, response.email);
                            }
                            else {
                                $scope.bookEvent(process.param.start, process.param.end);
                            }

                            $scope.resetBookingSelection();

                            break;

                        case "start":
                            $scope.startCurrentMeeting();
                            break;

                        case "extend":
                            $scope.extendCurrentMeeting(process.param.time);
                            break;

                        case "end":
                            $scope.endCurrentMeeting();
                            break;

                        default:
                            console.log("Unknown request action");
                    }
                },
                function errorCallback(response) {
                    showLoading(response.message, true, 3000);
                }
            );
        }
        else {
            //$scope.kHide();
            $scope.hideAuth();
        }

        if (process.action == "book") {
            $scope.resetBookingSelection();
        }
    };

    //show Event page
    $scope.showEvent = function () 
    {
        if (atEvent)
            return;

        booking = false;
        searching = false;
        atEvent = true;
        atExtend = false;
        
        SlideIn("#event");

        $timeout(function () { 
            $scope.tapped = false;
        },500);
    };

    //get the next slots available for extend max(4)
    $scope.getNextAvailableSlotsForExtend = function ()
    {
        if (!$scope.event || !$scope.event.slots || !$scope.event.slots.length)
            return 4;
        var total = 0;
        
        for (var i = $scope.getCurrentEventSlotCountFromNow(); i < 5; i++)
        {
            if ($scope.event.slots[i].available == false)
                break;
            total++;
        }
        return total;
    };
    
    //get Current event slot occupancy count from current time
    $scope.getCurrentEventSlotCountFromNow = function ()
    {
        if (!$scope.event || !$scope.event.slots || !$scope.event.slots.length || !$scope.event.currentEvent)
            return 0;

        var now = moment();
        
        var et = moment($scope.event.currentEvent.end);

        var differenceInSlots = Math.ceil((et.diff(now) / 1000) / 1800);

        return differenceInSlots;
    };

    $scope.executeIfOnline = function (callback)
    {
        if ($scope.online && $scope.online == false)
        {
            showLoading("Cannot establish a connection to the server, Please try again later",true,3000);
            return true;
        }
        else 
        {
            if (callback && typeof callback === "function")
                callback();
            return false;
        }
    };

    //detect whether room is available for extension after the current meeting expires
    $scope.isRoomAvailableAfterCurrentMeeting = function ()
    {
        if (!$scope.event || !$scope.event.slots || !$scope.event.slots.length || !$scope.event.currentEvent)
            return false;
        
        var differenceInSlots = $scope.getCurrentEventSlotCountFromNow();

        if (differenceInSlots < 4 && $scope.getNextAvailableSlotsForExtend() > 0 )
            return true;
        else
            return false;
    };

    //get the next slots available from start time
    $scope.getNextAvailableSlotsFromStart = function (start)
    {
        if (!$scope.event || !$scope.event.slots || !$scope.event.slots.length)
            return 4;

        $scope.rangeStart = start;// + ($scope.page * 10);
        
        angular.copy($scope.event.slots,$scope.copy);
        
        for (var j = 0; j< $scope.copy.length; j++)
            $scope.copy[j].available = false;

        $scope.copy[start].inRange = true;

        for (var i = start + 1; i < $scope.copy.length; i++)
        {
            if ($scope.event.slots[i].available == false)
                break;
            $scope.copy[i].available = true;
        }

        $scope.selectMessage="Select Event End Time";
    };

    $scope.highlightRange = function (start,end)
    {
        //end = end + ($scope.page * 10);
        for (var i = start; i <= end; i++)
            $scope.copy[i].inRange = true;
        $scope.rangeEnd=end;
        $scope.selectMessage="Confirm Event Timing";

        //bookEvent(event.slots[rangeStart].start, event.slots[rangeEnd].end)
        $timeout($scope.confirmBooking);
    };

    $scope.confirmBooking = function ()
    {
        showLoading("Meeting time:\n" + moment($scope.event.slots[$scope.rangeStart].start).format("h:mm A") + " - " + moment($scope.event.slots[$scope.rangeEnd].end).format("h:mm A"), true, null, {
            "enabled":true,
            "onYes":function(){
                $timeout(function(){
                    process.action = "book";

                    process.param = {
                        start: $scope.event.slots[$scope.rangeStart].start,
                        end: $scope.event.slots[$scope.rangeEnd].end
                    };

                    $scope.signIn();
                },100);
            },
            "onNo":function(){
                $scope.resetBookingSelection();
            }
        }, "Confirm room booking?");
    };

    $scope.confirmStartMeeting = function ()
    {
        showLoading($scope.event.currentEvent.title, true, null, {
            "enabled":true,
            "onYes":function(){
                $timeout(function(){
                    process.action = "start";
                    $scope.signIn();
                },100);
            },
            "onNo":function(){
            }
        }, "Start this meeting now?");
    };

    $scope.confirmEndMeeting = function ()
    {
        showLoading($scope.event.currentEvent.title, true, null, {
            "enabled":true,
            "onYes":function(){
                $timeout(function(){
                    process.action = "end";
                    $scope.signIn();
                },100);
            },
            "onNo":function(){
            }
        }, "End current meeting?");
    };

    $scope.confirmExtendMeeting = function ()
    {
        var newTime = moment($scope.event.currentEvent.end).add(30, "minutes");

        showLoading($scope.event.currentEvent.title, true, null, {
            "enabled":true,
            "onYes":function(){
                $timeout(function(){
                    process.action = "extend";
                    process.param = { time: newTime.toISOString() };
                    $scope.signIn();
                },100);
            },
            "onNo":function(){
            }
        }, "Extend meeting until " + newTime.format("h:mm A")  + " ?");
    };

    $scope.resetBookingSelection = function ()
    {
        $scope.rangeStart=-1;
        $scope.rangeEnd=-1;
        $scope.firstSlotPage();
        $scope.selectMessage="Room Booking Slots";
    };

    $scope.login = function () {
        //$scope.kHide();

        if ($("#authUID").val().length > 0 && $("#authPWD").val().length > 0) {
            process.user = {
                uid: $("#authUID").val(),
                pwd: $("#authPWD").val(),
            };

            $scope.processRequest(true);
        }
    };

    $scope.signIn = function () {
        // auto login
        if(_autoLogin) {
            process.user = { uid: null, pwd: null };

            $scope.processRequest(true);
        }
        else {
            $("#authUID").focus();
        }
    };

    $scope.hideAuth = function () {
        $scope.showAuth = false;
    }

    $scope.nextSlotPage = function ()
    {
        if ($scope.page < $scope.getPagesLeft() - 1)
            $scope.page = $scope.page + 1;
    };

    $scope.prevSlotPage = function ()
    {
        if ($scope.page > 0)
            $scope.page = $scope.page - 1;   
    };

    $scope.firstSlotPage = function ()
    {
        $scope.page = 0;
    };
    
    $scope.getPagesLeft = function ()
    {
        var now = moment();
        var midnight = moment().startOf("day").add(1, 'day');
        var duration = moment.duration(midnight.diff(now));
        var hours = duration.asHours();
        var halfHours = hours * 2;
        return (halfHours % 10) == 0 ? halfHours / 10 : Math.floor(halfHours / 10) + 1;

    };

    //translate facility names for tooltips
    $scope.getFullFacilityName = function (facility)
    {
        var facilities = {
            "P" : "Projector Available",
            "W" : "Wi-Fi Available",
            "B" : "Whiteboard Available",
            "T" : "Screen Available",
            "Default" : "Available Facility"
        };
        return facilities[facility]||facilities["Default"];
    };
    
    scope.getFromProxy=function(url){
        //no longer used, was used for getting the data through a proxy
        var replaceAll=function(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        };
        var deferred=$q.defer();
        var baseURL="https://app1.cloud.appspace.com/api/v1/core/proxy/jsonprequest?url=";
        var fullURL=baseURL +  replaceAll(replaceAll(url,"%","%25"),"&","%26");
        $http({
            method: 'GET',
            url: fullURL
        }).then(function successCallback(response) {
            var retObj=response;
            deferred.resolve(retObj);
        }, function errorCallback(response) {
            deferred.reject(null);
        });
        return deferred.promise;
    };

    //detect if array values have been changed
    var valuesChanged = function (arr1,arr2,vars)
    {
        var changed = false;
        if (vars && vars.constructor === Array)
        {
            for (var i in vars){
                if (!arr1[vars[i]] || !arr2[vars[i]])
                    changed = true;
                if (arr1[vars[i]] && arr2[vars[i]] && arr1[vars[i]] != arr2[vars[i]])
                    changed = true;
            }
        }
        else if(vars && vars != "")
        {
            if (!arr1[vars] || !arr2[vars])
                changed = true;
            if (arr1[vars] && arr2[vars] && arr1[vars] != arr2[vars])
                changed = true;
        }
        return changed;
    };

    //update idle threads if screensaver mode is activated
    var updateScreenSaverActivation = function (enabled)
    {
        if (enabled && enabled == true)
            startIdleTimeout();
        else
            stopIdleTimeout();
    };

    //determine should we refresh the connections and update the data when certain model values change
    var determineReloadData = function ()
    {
        var proceed = function() {
            console.log("Details Changed, updating...");

            $scope.loadRoom();
            $scope.loadData(function(){$scope.updateWorker()}); 
        }

        if (valuesChanged(scope.modelObj,scope.prevModel,["server","roomId"]))
        {
            firstRun=true;
            proceed();
        }
    };

    //update features activation
    var updateActiveFeatures = function ()
    {
        $scope.interactive = scope.modelObj.features.indexOf("interactive") != -1;
        $scope.allowOther = scope.modelObj.features.indexOf("allowOther") != -1;
        $scope.cancellable = scope.modelObj.features.indexOf("cancellable") != -1;
        $scope.extendable = scope.modelObj.features.indexOf("extendable") != -1;
        $scope.searchable = scope.modelObj.features.indexOf("searchable") != -1;
        $scope.deferCancel = scope.modelObj.features.indexOf("deferCancel") != -1;
        $scope.mustStart = scope.modelObj.features.indexOf("mustStart") != -1;
        //$scope.range = scope.modelObj.features.indexOf("range") != -1;
        $scope.offlinePassive = scope.modelObj.features.indexOf("offlinePassive") != -1;
        _autoLogin = scope.modelObj.features.indexOf("autoLogin") != -1;
        $scope.disableBookingSlot = scope.modelObj.features.indexOf("disableBookingSlot") != -1;
    };

    //get Logo path
    var getLogoFromModel = function (model,defaultPath)
    {
        if (model && model[0] && model[0].path)
            return model[0].path;
        return defaultPath;
    };

    //update screensaver object with mode and duration
    var createScreenSaverObject = function ()
    {
        var modelDurationInt = parseInt(scope.modelObj.idleDuration); 
        var durationInt = modelDurationInt > 0 ? modelDurationInt : 3;
        return {
                "enabled" : scope.modelObj.features.indexOf("screensaver")!=-1,
                "mode" : scope.modelObj.screenSaverMode,
                "duration" : durationInt * 60 * 1000
        }
    };

    //used for advanced mode to determine position of booking button based on some parameters
    $scope.determineBookingButtonTop = function () 
    {
        var originalTop = {'top':'33vh'};
        if (($scope.online && $scope.interactive && (($scope.extendable && $scope.isRoomAvailableAfterCurrentMeeting()==true) || ($scope.cancellable && $scope.canCancelEvent) || ($scope.mustStart && !$scope.currentStarted))))
            return {};
        return originalTop;
    };

    //get all Player properties
    var getPlayerProperties = function () 
    {
        config = $cardApi.getConfig();
        if (config && config.properties)
            return config.properties;
        return null;
    };

    //get specific player property
    var getPlayerProperty =function (key) 
    {
        var properties = getPlayerProperties();
        if (properties != null)
            return properties[key] || null;
        return null;
    };

    //create base model object
    var createModelObj = function ()
    {
        var defaultFeatures = ["interactive","allowOther","cancellable","extendable","screensaver","deferCancel","mustStart"];

        var icons = [];

        if (getPlayerProperty("meeting.room.facility") != null) {
            var f = getPlayerProperty("meeting.room.facility");

            if (f.length > 0) {
                icons = f.split(",");
            }
        }

        return {
            "server" : $cardApi.getModelProperty("server").value || "https://outlook.office365.com/ews/exchange.asmx",
            "roomId" : getPlayerProperty("meeting.room.address") != null ? getPlayerProperty("meeting.room.address") : $cardApi.getModelProperty("email").value || "",
            "icons" : icons,
            "features" : $cardApi.getModelProperty("features").value || defaultFeatures,
            "idleDuration" : $cardApi.getModelProperty("idleDuration").value || 3,
            "screenSaverMode" : $cardApi.getModelProperty("screensaverMode").value || "bounce",
            "refreshTimeout" : $cardApi.getModelProperty("refreshTimeout").value?parseInt($cardApi.getModelProperty("refreshTimeout").value):60,
            "lightapiusername" : $cardApi.getModelProperty("lightapiusername").value || "admin",
            "lightapipassword" : $cardApi.getModelProperty("lightapipassword").value || "",
        }
    };


    //update data reload timer
    var updateRefresh = function ()
    {
        LOAD_REFRESH = scope.modelObj.refreshTimeout;
        
        registerThreads();
    };

    var determineStorage = function ()
    {
        if (window && window.localStorage)
            storage = window.localStorage;

        if (window && window.parent && window.parent.$asCoreFrameworkService)
            storage = 
            {
                setItem : function(key,value) {
                    window.parent.$asCoreFrameworkService.getServices().storage.storageLocalStorageService.set("meetingRoomsCard",key,value);
                },
                getItem : function(key) {
                    return window.parent.$asCoreFrameworkService.getServices().storage.storageLocalStorageService.get("meetingRoomsCard",key);
                }
            };
    };

    //update model values
    scope.updateModel = function ()
    {
        if (firstRun) {
            showLoading(undefined, undefined, 1000);
        }
      
        console.log("Update Model");

        $timeout(function(){
            determineStorage();

            scope.modelObj = createModelObj();

            updateActiveFeatures();

            $scope.logo = getLogoFromModel(scope.modelObj.logoPath,"img/logo.png");
            $scope.theme = scope.modelObj.theme=="light"?{}:{'filter':'invert()'};
            $scope.queryTheme = scope.modelObj.theme == "light" ? {} : {'background-color':'rgba(255,255,255,0.8)'};
            $scope.screenSaverMode = createScreenSaverObject();

            updateScreenSaverActivation($scope.screenSaverMode.enabled);

            updateRefresh();

            determineReloadData();

            scope.prevModel = {};
            angular.copy(scope.modelObj, scope.prevModel);
          
            // set screensaver bg, logo
            // set logo main
            $scope.logoMainUrl = ($cardApi.getModelProperty("logoMain").value.length == 1) ? $cardApi.getModelProperty("logoMain").value[0].path : 'img/logo.png';
           
            // set main bg
            var _mainBgUrl = ($cardApi.getModelProperty("mainBackground").value.length == 1) ? $cardApi.getModelProperty("mainBackground").value[0].path : 'img/background.png';
            $scope.mainBg = {
                "background": "url('" + _mainBgUrl+ "')",
                "background-repeat":"no-repeat",
                "background-size":"100vw 100vh"
            };

            // set screen saver bg
            var _screenSaverBgUrl = ($cardApi.getModelProperty("screensaverBg").value.length == 1) ? $cardApi.getModelProperty("screensaverBg").value[0].path : 'img/screensaver.png';
            $scope.screenSaverBg = {
                "background": "url('" + _screenSaverBgUrl+ "')",
                "background-repeat":"no-repeat",
                "background-size":"100vw 100vh"
            };
        });
    };

    var hasNotified = false;

    //used for properties fetching
    scope.onMessage = function (ev)
    {
        if (ev == undefined || ev.message == undefined)
            return;

        var eventType = ev.message.toLowerCase();

        if (eventType == "api.init" && !hasNotified)
        {
            // hasInitialized = true;
            hasNotified = true;
            // scope.updateModel();
            $cardApi.notifyOnLoad();
        }
    };
    
    //update clock and other values for the UI
    $scope.updateWorker = function () 
    {
        $timeout ( function ()
        {   
            updateClock();

            updateTimeSlots();

            updateActiveSlotTiming();

            updateCanCancelEvent();

            updateShouldAutoCancel();

            updateUI();

            updateLighting();

            updateCanExtendEvent();
        });
    };
    //update lighting
    var updateLighting = function ()
    {
        if($scope.isCurrent() && ($scope.currentlightstatus==CONST_GREEN||$scope.currentlightstatus=="")){
            $scope.currentlightstatus = CONST_RED;
            console.log("Updating Lighting:Red");
            updateLightingAPI();
        }
        else if(!$scope.isCurrent() &&  ($scope.currentlightstatus == CONST_RED ||$scope.currentlightstatus=="")){
            $scope.currentlightstatus = CONST_GREEN;
            console.log("Updating Lighting:Green");
            updateLightingAPI();
        }
    };

    var updateLightingAPI = function ()
    {
        var colorcode = $scope.currentlightstatus == CONST_RED ? CONST_REDCODE : ($scope.currentlightstatus == CONST_GREEN ? CONST_GREENCODE:"");

        var querytoken = {
            "grant_type":"password",
            "username" : scope.modelObj.lightapiusername,
            "password":scope.modelObj.lightapipassword
        }  
        $cardApi.api.xhr({
        method: "POST",
        url: "http://localhost:80/v2/oauth2/token",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(querytoken)
    }).then(function successCallback(tokenresponse) {
        var querylight = {
            "name":"frame",
            "brightness" : colorcode==""?0:1,
            "color":colorcode
        }  
        $cardApi.api.xhr({
            method: "POST",
            url: "http://localhost:80/v2/oauth2/token",
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization': 'Bearer ' + tokenresponse.access_token,
            },
            data: JSON.stringify(querylight)
        }).then(function successCallback(response) {
                console.log(response);
        },
        function errorCallback(response) {
            console.log(response);
        });
    },
    function errorCallback(response) {
        console.log(response);
    });
       
    };

    //check whether to show extend button
    var updateCanExtendEvent = function () {
        var show = false;

        var starting = moment($scope.event.currentEvent.start);
        var ending = moment($scope.event.currentEvent.end);
        var b4EndinMins = ending.diff(moment(), 'minutes');

        
      if(b4EndinMins<=30){
        show=true;
      }
    //   else{
    //     var currentTime =  new date();
    //     show = (endTime - currentTime) < 30;
    //   }
        $timeout(function(){
            $scope.canExtend=show;
        });
    };

    //update current meeting if offline and update availability of first slot based on current time
    var updateUI = function ()
    {
        if (!$scope.online || wentOffline)
            $scope.handleOffline();
        checkFirstAvailableSlotAlmostEnding();
    };

    //get current time slot floor and ceiling
    var updateTimeSlots = function () 
    {
        $scope.currentTimeSlots={'down' : exchange.getNearestSlotDown(),'up' : exchange.getNearestSlotUp()};
    };

    //update active/next event ends and starts in
    var updateActiveSlotTiming = function () 
    {
        $scope.isUpcomingToday = $scope.upcoming && $scope.upcoming.length && (moment($scope.upcoming[0].start).diff(moment(),"days")==0);
        
        if ($scope.event.currentEvent != undefined && !moment($scope.event.currentEvent.end).isBefore(moment())) 
        {
            $scope.remaining = moment($scope.event.currentEvent.end).from(moment());
        }
        else if($scope.isUpcomingToday==true)
        {
            $scope.remaining = moment($scope.upcoming[0].start).from(moment());
        }
        else 
        {
            $scope.remaining = null;
        }

    };

    //determine whether canceling is allowed 
    var updateCanCancelEvent = function () 
    {
        if ($scope.isCurrent()){
            var age = moment().diff(moment($scope.event.currentEvent.start), "minutes");
            $scope.canCancelEvent= age >= 15 || $scope.deferCancel==false;
        }
        else
        {
            $scope.canCancelEvent=false;
        }
    };

    //determine whether the meeting should be auto canceled in 15 minutes if not started
    var updateShouldAutoCancel = function () 
    {
        if ($scope.isCurrent() && $scope.mustStart) {
            
            if ($scope.currentStarted==false && $scope.online)
            {
                var meetingAge = moment().diff(moment($scope.event.currentEvent.start), "minutes");
                var ageSinceAvailable = moment().diff(moment($scope.lastAvailableTimestamp), "minutes");
                
                if (ageSinceAvailable >= 10 && meetingAge >= 10)
                {    
                    $scope.cancelCurrentMeeting($scope.event.currentEvent.id, $scope.event.currentEvent.key);
                    $scope.lastAvailableTimestamp=moment().toISOString();
                }
            }
        }
        else
        {
            $scope.currentStarted=false;
            $scope.lastAvailableTimestamp=moment().toISOString();
        }
    };

    //update time and date
    var updateClock = function () 
    {
        $scope.clock = moment().format("h:mm a");
        $scope.dateDisplay = moment().format("dddd, D MMM YYYY");
        $scope.date = moment().format("YYYY-MM-DD");  
    };

    //set current meeting to started
    $scope.startCurrentMeeting = function ()
    {
        if ($scope.mustStart && $scope.currentStarted == false) {
            $scope.currentStarted = true;
            //$scope.$storage.eventId = $scope.event.currentEvent.id;
            //$scope.$storage.started = c;
            storage.setItem("eventId", $scope.event.currentEvent.id);
            storage.setItem("started", moment().toISOString());
        }
    };

    $scope.cancelCurrentMeeting = function(eventId, eventKey)
    {
        if (!canceling)
        {
            canceling = true;
            showLoading("Cancelling Meeting...");

            exchange.cancelBooking(scope.modelObj.server, eventId, eventKey).then(
                function successCallback(response) {
                    canceling = false;
                    if (response.status == "OK")
                    {
                        $scope.extendEvent = "";

                        showLoading("Meeting Cancelled",true,6000);
                        setTimeout(function(){$scope.loadData()},4000);
                        $scope.justBooked = false;
                    }
                    else
                    {
                        showLoading("Cancellation failed.",true,3000);    
                    }
                },
                function errorCallback(response){
                    showLoading("Cancellation Failed!",true,3000);
                    canceling=false;
                }
            );   
        }
    };

    //cancel current meeting with exchange
    $scope.endCurrentMeeting = function()
    {
        if (!altering)
        {
            altering = true;
            showLoading("Ending Current Meeting...");

            //var start = moment($scope.event.currentEvent.start).toISOString();
            var end = moment().toISOString();

            exchange.changeBooking(scope.modelObj.server, $scope.event.currentEvent.id, $scope.event.currentEvent.key, end).then(
                function successCallback(response){
                    altering = false;

                    if (response.status == "OK")
                    {
                        showLoading("Meeting Ended",true,6000);
                        setTimeout(function(){$scope.loadData()},4000);
                        $scope.extendEvent = "";
                    }
                    else
                    {
                        showLoading("Unable to end current meeting.",true,3000);    
                    }
                },
                function errorCallback(response){
                    showLoading("Unable to end current meeting!",true,3000);
                    altering = false;
                }
            );   
        }
    };

    $scope.nextSlotAvailable = function (eventId) {
        var vacant = false;

        var slot = -1;

        for (var i = 0; i < $scope.event.slots.length; i++) {
            if ($scope.event.slots[i].meetingObj != null && $scope.event.slots[i].meetingObj != undefined && $scope.event.slots[i].meetingObj.id == eventId) {
                slot = i;
            }
        }

        if (slot > -1 && (slot + 1 < $scope.event.slots.length) && $scope.event.slots[slot + 1].available) {
            vacant = true;
        }

        return vacant;
    };

    //extend current meeting from exchange
    $scope.extendCurrentMeeting = function(newTime)
    {
        if (!extending)
        {   
            extending = true;

            showLoading("Extending Meeting...");

            //var start = moment($scope.event.currentEvent.start).toISOString();
            var newEnd = moment(newTime).toISOString();

            exchange.changeBooking(scope.modelObj.server, $scope.event.currentEvent.id, $scope.event.currentEvent.key, newEnd).then(
                function successCallback(response){
                    extending = false;

                    if (response.status == "OK")
                    {
                        $scope.extendEvent = $scope.event.currentEvent.id;

                        showLoading("Meeting Extended",true,6000);
                        $scope.showEvent();

                        $scope.justBooked = true;
                        $timeout(function(){
                            $scope.justBooked = false;
                        },(LOAD_REFRESH * 1000)+ 1000);
                        
                        setTimeout(function(){$scope.loadData()},4000);
                    }
                    else
                    {
                        showLoading("Unable to extend current meeting.",true,3000);    
                    }
                },
                function errorCallback(response){
                    showLoading("Extension Failed!",true,3000);
                    extending=false;
                }
            );   
        }
    };
    
    //extend current meeting from exchange
    $scope.updateAttendance = function (attendee)
    {
        if (!marking)
        {   
            marking = true;

            showLoading("Update Attendance...");

            var start = moment($scope.event.currentEvent.start).toISOString();
            var newEnd = moment(newTime).toISOString();

            exchange.insertAttendance(scope.modelObj.server, $scope.event.currentEvent.id, start, newEnd).then(
                function successCallback(response){
                    extending = false;

                    if (response.data && response.data.status.toLowerCase()=="success")
                    {
                        $scope.extendEvent = $scope.event.currentEvent.id;

                        showLoading("Meeting Extended",true,6000);
                        $scope.showEvent();

                        $scope.justBooked = true;
                        $timeout(function(){
                            $scope.justBooked = false;
                        },(LOAD_REFRESH * 1000)+ 1000);
                        
                        setTimeout(function(){$scope.loadData()},4000);
                    }
                    else
                    {
                        showLoading("Unable to extend current meeting.",true,3000);    
                    }
                },
                function errorCallback(response){
                    showLoading("Extension Failed!",true,3000);
                    extending=false;
                }
            );   
        }
    };

    //hide results in search page
    $scope.hideResults = function ()
    {
        $("#result").hide();
    };

    //is there a meeting currently
    $scope.isCurrent = function () 
    {
        if ($scope.event != null && $scope.event.currentEvent != undefined) {
            var s = moment($scope.event.currentEvent.start);
            var e = moment($scope.event.currentEvent.end);

            var state = moment().isBetween(s, e);

            if (state) {
                $("#keepAlive").click();
            }

            return state;
        }
        else {
            return false;
        }
    };
    
    //show loading overlay with parameters to change message , display/hide spinned , timeout for auto hiding
    var showLoading = function (message, hideSpinner, timeout, dialog, dialogMsg)
    {
        $timeout(function(){
            $scope.isLoading=true;
            $scope.updateWorker();
            $scope.loadingMessage=message||"Please hold on...";
            $scope.showSpinner = hideSpinner?false:true;
            $scope.showOverlay = true;
            $scope.showDialog = false;
            $scope.showAuth = false;
            $timeout.cancel(loadingTimer);
            if (timeout && parseInt(timeout) > 0)
                loadingTimer = $timeout(function(){hideLoading(true)},parseInt(timeout));

            $scope.onYesCallback = function(){hideLoading(true)};
            $scope.onNoCallback = function(){hideLoading(true)};

            if (dialog && dialog.enabled == true)
            {
                $scope.dialogTop = message;
                $scope.dialogBottom = dialogMsg || "";

                if (dialog.onYes && typeof dialog.onYes ==="function") {
                    $scope.onYesCallback = function() {
                        dialog.onYes();
                        hideLoading(true);

                        if (!_autoLogin) {
                            $scope.showAuth = true;
                        }
                    };
                }

                if (dialog.onNo && typeof dialog.onNo ==="function") {
                    $scope.onNoCallback = function() {
                        dialog.onNo();
                        hideLoading(true);
                        $scope.showAuth = false;
                    };
                }

                $scope.showSpinner = false;
                $timeout.cancel(loadingTimer);
                $scope.showDialog = true;
            }
        });
    };

    //hide loading overlay and decide whether to go to event page or stay at current view
    var hideLoading=function(keep)
    {
        $timeout(function(){
            $scope.isLoading=false;
            $scope.updateWorker();
            $scope.showOverlay=false;
            //$scope.showAuth = false;
            
            switch (keep)
            {
                case true:
                    break;

                default:
                    $scope.showEvent();
            }

        },100);
    };

    //book room on specific start/end times
    $scope.bookEvent = function (startTime, endTime, user) 
    {
        if (!currentlyBooking)
        {
            if ($scope.room !== null && $scope.room.id !== undefined && startTime !== undefined && endTime !== undefined) {
                
                currentlyBooking = true;
                
                showLoading("Booking in progress...");
                console.log(startTime, endTime, user);
                
                //exchange.bookRoom(scope.modelObj.server, scope.modelObj.roomId, startTime, endTime, "Quick Book Event", user).then(
                exchange.bookRoom(scope.modelObj.server, scope.modelObj.roomId, startTime, endTime, "Quick Book Event", user).then(    
                    function successCallback (response) {
                        currentlyBooking = false;
                        //var status = response.data;
                        booking = false;
                        var eventRange=moment().range(moment(startTime),moment(endTime));
                        if (moment().within(eventRange))
                        {    
                            $scope.justBooked = true;
                            $timeout(function(){
                                $scope.justBooked = false;
                            },(LOAD_REFRESH * 1000)+ 1000);
                        }
                        showLoading("Booked Successfully",true,7000);
                        $timeout(function(){
                            $scope.loadData(function(){
                                $scope.booking = false; 
                                $scope.showEvent();
                            });
                        },5000);
                    },
                    function errorCallback(response){
                        currentlyBooking = false;
                        console.log("Booking failed.");
                        booking=false;

                        showLoading("Booking Failed",true,3000);
                        $scope.loadData(function(){
                            $scope.booking = false; 
                            $scope.showEvent();
                        });
                    }
                );
            }
        }
    };

    //am I ready for communication with the server, mainly used for NTLM
    var isReadyForRequests = function ()
    {
        return true;
    };

    //determine whether to enable/disable booking of first slot based on current time
    var checkFirstAvailableSlotAlmostEnding = function () 
    {
        if ($scope.event != null && $scope.event.slots != undefined && $scope.event.slots[0].available != undefined && $scope.event.slots[0].available && $scope.event.slots[0].end != undefined) {
            var ending = moment($scope.event.slots[0].end);
            var timediff = ending.diff(moment(), 'seconds');

            if (timediff <= SLOT_RESTRICT) 
                $scope.event.slots[0].available = false;
            
        }
    };

    //used to hide loading when starting the card and notify appspace we are ready, 
    //error parameter causes conflicts with thumbnail generation so it is not used for now
    var endFirstRun = function (error) 
    {
        firstRun = false;
        hideLoading();
        if (error)
        {
            $scope.online = false;
            if (storage.getItem("meeting.room.card.timestamp") != null && moment().diff(moment(storage.getItem("meeting.room.card.timestamp")),"days") <3)
            {
                $scope.event = JSON.parse(storage.getItem("meeting.room.card.event"));
                $scope.upcoming = JSON.parse(storage.getItem("meeting.room.card.upcoming"));
                $scope.room = JSON.parse(storage.getItem("meeting.room.card.room"));
                $scope.handleOffline();
            }
        }
        //else
        //{
        //    $cardApi.notifyOnLoad();
        //}
    };

    //load room schedule details from exchange
    $scope.loadData = function (callback) 
    {
        if (extending || currentlyBooking || searching || canceling)
            return;
        
        if (!isReadyForRequests() && wentOffline)
        {
            $interval.cancel(dataThread);
            
            $scope.handleOffline();
            $timeout($scope.loadData);

            return;
        }

        if (!isReadyForRequests())
            return;
        
        if (!loading && $scope.room.folder) {
            loading = true;
            
            if (firstRun)
                showLoading();
            
            exchange.getNextXDays(scope.modelObj.server, $scope.room.folder, 3).then(
                function successCallback(response) {
                    console.log(response);

                    loading = false;
                    $scope.online=true;
                    $scope.event = response.data;
                    $scope.upcoming=response.data.upcoming;

                    //$scope.currentStarted = ($scope.event.currentEvent != null && $scope.$storage.eventId == $scope.event.currentEvent.id);
                    $scope.currentStarted = ($scope.event.currentEvent != null && storage.getItem("eventId") == $scope.event.currentEvent.id);
                       
                    storage.setItem("meeting.room.card.event",JSON.stringify(response.data));
                    storage.setItem("meeting.room.card.upcoming",JSON.stringify(response.data.upcoming));
                    storage.setItem("meeting.room.card.timestamp",moment().toISOString());
                        
                    checkFirstAvailableSlotAlmostEnding();

                    if (!booking && !searching && !atExtend) {
                        $scope.showEvent();
                    }
                        
                    if (firstRun)
                        endFirstRun();

                    if (callback && typeof callback ==="function")
                        callback();
                },
                function errorCallback(){
                    loading = false;
                    console.log("Meeting Schedules load failed, working in offline mode, attempting to reload on next cycle...");
                    $scope.online = false;
                    
                    if (!atEvent)
                        $scope.showEvent();

                    if (firstRun)
                        endFirstRun(true);
                    else
                        $scope.handleOffline();
                }
            );
        }
    };

    //load room name and facilities from exchange
    $scope.loadRoom = function () 
    {
        if (!isReadyForRequests())
        {
            roomTimer = $timeout($scope.loadRoom, ROOM_RETRY * 1000);
            return;
        }
        
        if (roomTimer != null) {
            $timeout.cancel(roomTimer);
            roomTimer = null;
        }

        if (scope.modelObj.roomId) {

            console.log("Start loading room");

            exchange.getRoomDetail(scope.modelObj.server,scope.modelObj.roomId).then(
                function successCallback(response) {
                    $timeout(function(){
                        $scope.room = response;
                        $scope.room.facilities = scope.modelObj.icons;
                        console.log($scope.room);
                        storage.setItem("meeting.room.card.room", JSON.stringify($scope.room));
                    });
                }, 
                function errorCallback(response) {
                    console.log("Room detail loading failed. Reattempt later.");
                    roomTimer = $timeout($scope.loadRoom, ROOM_RETRY * 1000);
                }
            );
        }
    };

    //if i am offline work with cached data and clean them up based on current time
    $scope.handleOffline = function () 
    {
        $timeout(function(){
            $scope.event=exchange.offline.cleanup($scope.event);
            $scope.upcoming=$scope.event.upcoming;
        });
    };

    //stop timeout for screensaver
    var stopIdleTimeout = function ()
    {
        $timeout(function(){
            $scope.idle=false;
            $scope.resetBookingSelection();
            stopScreenSaverMode();
            idle.stopWatching();
        });
    };

    //start screensaver
    var runScreenSaver = function () 
    {
        $timeout(function(){
            $scope.idle=true;
            
            $scope.hideAuth();
            
            if ($scope.screenSaverMode.mode=="bounce")
                startBouncingScreen();
            else
                $cardApi.notifyOnComplete();
            
            $scope.showEvent();
        });
    };

    //stop screensaver
    var endScreenSaver = function () 
    {
        $timeout(function(){
            $scope.idle=false;
            $scope.resetBookingSelection();
            stopScreenSaverMode();
        })
    };

    var handleKeypress = function (e) {
        if (startedKeyCapture == false && e.charCode == 37)
        {
            startedKeyCapture = true;
            capturedText = "";
            return;
        }

        if (startedKeyCapture == true && e.charCode == 13)
        {
            startedKeyCapture = false;
            console.log(capturedText);
            return;
        }

        if (startedKeyCapture == true)
        {
            capturedText += e.key;
            return;
        }

        if (startedKeyCapture == false)
        {
            if (e.code == "KeyL" && e.ctrlKey && e.altKey)
                console.log("combination");
            return;
        }
    };

    //start timeout for screensaver
    var startIdleTimeout = function ()
    {
        idle.startWatching(document,$scope.screenSaverMode.duration,runScreenSaver,endScreenSaver);
        idle.subscribeKeypress(handleKeypress);
    };

    //start bouncing screensaver
    var startBouncingScreen = function (preserveAspectRatio) 
    {
        var element=$("#ssContainer");

        var emulateSize=
        {
            "width" : $(window).width(),
            "height" : $(window).height()
        };

        var actualSize=
        {
            "width" : $("#screensaverOverlay").width(),
            "height" : $("#screensaverOverlay").height()
        };
        
        //calculate translate x and y to center the iframe
        var translateX = actualSize.width / emulateSize.width * 100;
        var translateY = actualSize.height / emulateSize.height * 100;

        //Apply transform scale and translate
        var transform = "translate(" + translateX + "%," + translateY + "%)";

        var cssTransform = 
        {
            "transform" : transform,
            "-webkit-transform" : transform,
        }

        element.css(cssTransform);
    };

    //stop screensaver and restore original styling(revert from bounciing window style)
    var stopScreenSaverMode = function () 
    {
        var element = $("#mainContainer");

        var cssTransform = {
            "transform" : "",
            "-webkit-transform" : "",
            "width" : "100vw",
            "height" : "100vh"
        }

        element.css(cssTransform);
    };
    
    //register timers for refresh of clock and schedule
    var registerThreads = function()
    {
        $interval.cancel(updateThread);
        $interval.cancel(dataThread);
        updateThread = $interval($scope.updateWorker, CLOCK_REFRESH * 1000);
        dataThread = $interval(function(){$scope.loadData()}, LOAD_REFRESH * 1000);    
    };            

    //initialize
    var init = function ()
    {
        $cardApi.subscribeModelUpdate (scope.updateModel);
        $cardApi.subscribeToMessages (scope.onMessage)
        $cardApi.init();
        
        $scope.showEvent();
    
        registerThreads();

        window.runScreenSaver=runScreenSaver;
        window.endScreenSaver=endScreenSaver;

        //setTimeout(function(){showLoading ("Are you sure?",true,null,{"enabled":true,"onYes":function(){console.log("yes")},"onNo":function(){console.log("no")}})},2000);
    };
    
    init();
    
    //refresh timeouts when window regains focus
    window.onfocus = function ()
    {
        $timeout(function() {
            registerThreads();
        },100);
    };

    $scope.$on("$destroy",function(){
        clearInterval(repeatAudioThread);
        $interval.cancel(updateThread);
        $interval.cancel(dataThread);
        $timeout.cancel(roomTimer);
        $timeout.cancel(tapTimer);
        $timeout.cancel(loadingTimer);
        clearInterval(redraw);
        idle.stopWatching();
    });

    // Keyboard
    //$scope.kShift = false;
    //$scope.kDisplay = false;
//
    //var kInput = null;
//
    //$scope.kShow = function (el) {
    //    $scope.kDisplay = true;
    //    kInput = "#" + el;
    //};
//
    //$scope.kHide = function () {
    //    $scope.kDisplay = false;
    //    kInput = null;
    //};
//
    //$scope.kClick = function (obj, key) {
    //    if (key == "SH") {
    //        $scope.kShift = !$scope.kShift;
    //    }
    //    else if (kInput != null) {
    //        var elem = $(obj.currentTarget);
//
    //        elem.removeClass("keyUp").addClass("keyDown");
    //        $timeout(function () {
    //            elem.removeClass("keyDown").addClass("keyUp");
    //        }, 100);
//
    //        $scope.kShift = false;
    //        var v = $(kInput).val();
//
    //        if (key == "BS") {
    //            if (v.length > 0) {
    //                $(kInput).val(v.substring(0, v.length - 1));
    //            }
    //        }
    //        else {
    //            $(kInput).val(v + key);
    //        }
    //    }
    //};
}]);
