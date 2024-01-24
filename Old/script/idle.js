(function(angular,$cardApi){
	var app=angular.module("idle",[]);
	app.factory("idleFactory",[function(){
		
		var state = "active";
		var thread = undefined;
		var idleCallback = function (){ state = "idle" };
		var activeCallback = function (){ state = "active" };
		var element = document;
		var duration = 60 * 1000;
		var keypressCallback = null;
		
		var listeners = {
			"mousemove":undefined,
			"keypress":undefined,
			"click":undefined,
			"mousedown":undefined,
			"touchstart":undefined,
			"touchmove":undefined
		};
			
		var resetThread = function (disableDetach)
		{
			clearTimeout(thread);
			thread = setTimeout(idleCallback, duration);
			
			if (state=="idle")
				activeCallback();
			
			if (disableDetach && disableDetach == true)
				return;

			detachListeners();
			setTimeout(attachListeners, 100);
		};

		var registerKeypressCallback = function (callback)
		{
			keypressCallback = callback;
		};

		var clearKeypressCallback = function ()
		{
			keypressCallback = null;
		};

		var isRegisteredKeypressCallback = function ()
		{
			return keypressCallback != null;
		};

		var handleKeypress = function (e)
		{
			if (isRegisteredKeypressCallback)
				keypressCallback(e);
			resetThread(true);
		}

		var createThread = function ()
		{
			thread = setTimeout(idleCallback, duration);
			attachListeners();
		};
		
		var attachListeners = function ()
		{
			listeners.mousemove = element.addEventListener("mousemove", resetThread);
			listeners.mousedown = element.addEventListener("mousedown", resetThread);
			listeners.keypress = element.addEventListener("keypress", handleKeypress);
			listeners.click = element.addEventListener("click", resetThread);
			listeners.touchstart = element.addEventListener("touchstart", resetThread);
			listeners.touchmove = element.addEventListener("touchmove", resetThread);
		};

		var detachListeners = function ()
		{

			listeners.mousemove = element.removeEventListener("mousemove", resetThread);
			listeners.mousedown = element.removeEventListener("mousedown", resetThread);
			listeners.keypress = element.removeEventListener("keypress", handleKeypress);
			listeners.click = element.removeEventListener("click", resetThread);
			listeners.touchstart = element.removeEventListener("touchstart", resetThread);
			listeners.touchmove = element.removeEventListener("touchmove", resetThread);
		};

		return {	
			startWatching : function (el,dur,onIdle,onActive)
			{
				if (el)
					this.setElement(el);

				if (dur)
					this.setDuration(dur);

				if (onIdle)
					this.setIdleCallback(onIdle);

				if (onActive)
					this.setActiveCallback(onActive);

				this.stopWatching();

				if (element && duration && idleCallback && activeCallback)
					createThread();
			},

			stopWatching : function ()
			{
				clearTimeout(thread);
				detachListeners();
			},

			setIdleCallback : function (callback)
			{
				if (callback && typeof callback === "function")
				{
					idleCallback = function () 
					{
						state = "idle";
						callback();
					};
				}
			},

			getIdleCallback : function ()
			{
				return idleCallback;
			},

			getActiveCallback : function () 
			{
				return activeCallback;
			},

			setActiveCallback : function (callback)
			{
				if (callback && typeof callback === "function")
				{
					activeCallback = function ()
					{
						state = "active";
						callback();
					}
				}
			},

			setDuration : function (val)
			{
				if (val && parseInt(val) === val)
					duration = val;
			},
			
			getDuration : function()
			{
				return duration;
			},

			setElement : function (val)
			{
				if (val)
					element = val;
			},

			getElement : function()
			{
				return element;
			},

			subscribeKeypress : function(callback)
			{
				if (callback && typeof callback === "function")
					registerKeypressCallback(callback);
				else
					clearKeypressCallback();
			},

			unsubscribeKeypress: function()
			{
				clearKeypressCallback();
			}
		
		};
	}]);
})(window.angular,window.$cardApi);