(function(angular,$cardApi){
	var app=angular.module("asLogger",[]);
	app.factory("logFactory",[function(){
        var logName = "appspace.cards.rooms";
        var logConfig = {};

        var logDump = [];

        var setName = function (value)
        {
            if (value != null)
                logName = value;
        };

        var getName = function ()
        {
            return logName;
        };

        var setConfig = function (config)
        {
            if (config == null)
                config = {};
            logConfig = config;
        };

        var getConfig = function ()
        {
            return logConfig;
        };

        var getAppspaceLogService = function()
        {
            try
            {
                if ($cardApi.isEditing())
                    return false;
                if (window.$asCoreFrameworkService)
                    return window.$asCoreFrameworkService.getServices().core.logService;
                if (window.parent && window.parent.$asCoreFrameworkService)
                    return window.parent.$asCoreFrameworkService.getServices().core.logService;
                return false;
            }
            catch (e)
            {
                return false;
            }
        
        };

        var createLogger = function()
        {
            var logger = getAppspaceLogService();
            if (logger == false)
                return false;
            return logger.addLogger({name:logName,config:logConfig});
        };

        var addEntry = function (entry)
        {
            logDump.push(entry);
            var logger = getAppspaceLogService();
            if (logger != false)
                return logger.debug(logName, entry);
            return false;
        };

        var getLogs = function ()
        {
            return logDump;
        }

        return {
            setName : setName,
            getName : getName,
            setConfig: setConfig,
            getConfig: getConfig,
            createLogger: createLogger,
            addEntry: addEntry,
            getLogs: getLogs
        };
        
	}]);
})(window.angular,window.$cardApi);