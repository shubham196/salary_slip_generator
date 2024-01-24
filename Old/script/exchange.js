(function (angular, $cardApi) {
	var app = angular.module("exchange", []);
	app.factory("exchangeFactory", ["$q", function ($q) {

		var getAPIUrl = function (server, api) {
			if (server.endsWith("/")) {
				return server + api;
			}
			else {
				return server + "/" + api;
			}
		};

		var dynamicSort = function (property) 
		{
		    var sortOrder = 1;
		    if(property[0] === "-") {
		        sortOrder = -1;
		        property = property.substr(1);
		    }
		    return function (a,b) {
		        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		        return result * sortOrder;
		    }
		};

		return {
			validUser: function (server, userId, employeeId) {
				var deferred = $q.defer();

				var query = { "id": userId, "employee": employeeId };

				$cardApi.api.xhr({
					method: "POST",
					url: getAPIUrl(server, "valid"),
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(query)
				}).then(function successCallback(response) {
					if (response.status == "OK") {
						deferred.resolve(response);
					}
					else {
						deferred.reject({ error: true, message: response.message });
					}
				},
				function errorCallback(response) {
					deferred.reject({ error: true, message: "Error validating user." });
				});

				return deferred.promise;
			},

			getRoomDetail: function (server, rid) {
				var deferred = $q.defer();

				var query = { "r": rid };

				$cardApi.api.xhr({
					method: "GET",
					url: getAPIUrl(server, "room?" + $.param(query))
				}).then(
					function successCallback(response) {
						console.log("Room Data loaded");

						if (response.status == "OK") {
							deferred.resolve(response.room);
						}
						else {
							deferred.reject({ error: true, message: response.message });
						}
					},
					function errorCallback(response) {
						deferred.reject({ error: true, message: "Error loading room detail." });
					}
				);

				return deferred.promise;
			},

			getRoomSchedule: function (server, folder, start, end) {
				var deferred = $q.defer();

				var rangeFrom = moment(start);
				var rangeTo = moment(end);

				var query = { "start": rangeFrom.toISOString(), "end": rangeTo.toISOString(), "folder": folder };

				$cardApi.api.xhr({
					method: "POST",
					url: getAPIUrl(server, "schedule"),
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(query)
				}).then(function successCallback(response) {
					if (response.status == "OK") {
						deferred.resolve(response.meetings);
					}
					else {
						deferred.reject({ error: true, message: response.message });
					}
				},
				function errorCallback(response) {
					deferred.reject({ error: true, message: "Error loading room schedule." });
				});

				return deferred.promise;
			},

			bookRoom: function (server, rid, mStart, mEnd, mTitle, user) {
				var deferred = $q.defer();

				var start = moment(mStart).toISOString() || moment().toISOString();
				var end = moment(mEnd).toISOString() || moment(start).add(30, 'minutes').toISOString();
				var title = mTitle || "Quick Book Event";

				var data = { "room": rid, "title": title, "start": start, "end": end, "organiser": null };

				if (user != null) {
					data.organiser = { "email": user };
				}

				$cardApi.api.xhr({
					method: "POST",
					url: getAPIUrl(server, "book"),
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(data)
				}).then(
					function successCallback(response) {
						console.log(response);

						if (response.status == "OK") {
							deferred.resolve(response.id);
						}
						else {
							deferred.reject({ error: true, message: response.message });
						}
					},
					function errorCallback(response) {
						deferred.reject({ error: true, message: "Book room failed." });
					}
				);

				return deferred.promise;
			},

			cancelBooking: function (server, item, key) {
				var deferred = $q.defer();

				console.log("Cancelling [" + item + "]");

				var data = { "id": item, "key": key };

				$cardApi.api.xhr({
					method: "POST",
					url: getAPIUrl(server, "cancel"),
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(data)
				}).then(
					function successCallback(response) {
						if (response.status == "OK") {
							deferred.resolve(response);
						}
						else {
							deferred.reject({ error: true, message: response.message });
						}
					},
					function errorCallback(response) {
						deferred.reject({ error: true, message: "Event cancel failed." });
					}
				);
				
				return deferred.promise;
			},

			changeBooking: function (server, item, key, finish) {
				var deferred = $q.defer();

				console.log("Changing [" + item + "] to " + finish);

				var end = moment(finish).toISOString() || moment().add(30, 'minutes').toISOString();

				var data = { "id": item, "key": key, "end": end };

				$cardApi.api.xhr({
					method: "POST",
					url: getAPIUrl(server, "edit"),
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(data)
				}).then(
					function successCallback(response) {
						if (response.status == "OK") {
							deferred.resolve(response);
						}
						else {
							deferred.reject({ error: true, message: response.message });
						}
					},
					function errorCallback(response) {
						deferred.reject({ error: true, message: "Event update failed." });
					}
				);

				return deferred.promise;
			},

			search : function(server, list, rid, facilities, startTime, endTime) {
				var deferred = $q.defer();

				var data = { "room": rid, "list": list, "start": startTime, "end": endTime, "facilities": facilities };

				$cardApi.api.xhr({
					method: "POST",
					url: getAPIUrl(server, "search"),
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(data)
				}).then(
					function successCallback(response) {
						if (response.status == "OK") {
							var list = response.rooms;

							var d = list.sort(dynamicSort("name"));

							deferred.resolve(d);
						}
						else {
							deferred.reject({ error: true, message: response.message });
						}
					},
					function errorCallback(response) {
						deferred.reject({ error: true, message: "Search failed." });
					}
				);

				return deferred.promise;
			},

			getNearestSlotDown: function () {
				var coeff = 1000 * 60 * 30;
				var date = new Date();  //or use any other date
				return new Date(Math.round((date.getTime() - 900000) / coeff) * coeff);
			},

			getNearestSlotUp: function () {
				var coeff = 1000 * 60 * 30;
				var date = new Date();  //or use any other date
				return new Date(Math.round((date.getTime() + 900000) / coeff) * coeff);
			},

			generateTimeSlots: function (startTime, total) {
				var itemCount = total || 6;
				var start = moment(startTime);
				var slots = [start.toISOString()];
				var time = start;

				var eod = moment(start).endOf('day');

				for (var i = 0; i < itemCount - 1; i++) {
					time = time.add(30, "minutes");

					if (time.isBefore(eod)) {
						slots.push(time.toISOString());
					}
				}
				return slots;
			},

			getNextXDays: function (server, folder, days) {
				var deferred = $q.defer();

				var scope = this;
				var start = moment(this.getNearestSlotDown()).toISOString();
				var end = moment(start).add(days, "days").toISOString();
				var slots = this.generateTimeSlots(start, days * 48);
				var retObj = {};
				retObj.data = { "slots": [], "currentEvent": null, "upcoming": [] };
				var errorCallback = function (data) {
					deferred.reject(data);
				};

				this.getRoomSchedule(server, folder, start, end).then(
					function successCallback(data) {
						retObj.data.slots = scope.generateBaseSlots(slots);
						var now = moment();

						if (data && data.length) {
							for (var i in data) {
								var meetingStart = moment(data[i].start);
								var meetingEnd = moment(data[i].end);
								
								if (now.isBetween(meetingStart, meetingEnd, null, "[)")) {
									retObj.data.currentEvent = data[i];
								}
								else if (now.isBefore(meetingStart)) {
									retObj.data.upcoming.push(data[i]);
								}

								retObj.data.slots = scope.updateSlotAtTime(retObj.data.slots, meetingStart, meetingEnd, data[i]);
							}
						}
						deferred.resolve(retObj);
					}, errorCallback);
				return deferred.promise;
			},

			updateSlotAtTime: function (slots, startTime, endTime, event) {
				if (slots && startTime && endTime && event) {
					var start = moment(startTime);
					var end = moment(endTime);
					var eventRange = moment().range(start, end);
					for (var i in slots) {
						var slotStart = moment(slots[i].start);
						var slotEnd = moment(slots[i].end);
						var slotRange = moment().range(slotStart, slotEnd);
						if (eventRange.intersect(slotRange)) {
							slots[i].available = false;
							slots[i].title = event.title;
							slots[i].meetingObj = event;
							if (end.isSameOrBefore(slotEnd))
								break;
						}

					}
				}
				return slots;
			},

			generateBaseSlots: function (slots) {
				var retObj = [];
				if (slots && slots.length) {
					for (var i in slots) {
						var start = moment(slots[i]);
						retObj.push({ "start": start.toISOString(), "end": start.add(30, "minutes").toISOString(), "available": true, "title": "", meetingObj: {} });
					}

				}
				return retObj;

			},

			offline: {
				
				cleanup : function (event)
				{
					event.slots=this.cleanSlots(event.slots);
					event.currentEvent=this.cleanCurrentEvent(event.currentEvent,event.upcoming);
					event.upcoming=this.cleanUpcomingEvents(event.upcoming);
					return event;
				},

				cleanSlots : function (slots)
				{	
					while (slots && slots.length && this.checkSlotExpired(slots[0])==true)
						slots.shift();	
					return slots;
				},

				checkSlotExpired : function (slot)
				{
					var now=moment();
            		if (!now.isBetween(moment(slot.start),moment(slot.end)) && !now.isSameOrBefore(slot.start))
            		{
            			return true;
            		}
            		return false;
				},

				cleanCurrentEvent : function (event,upcoming)
				{
					if (!event || (event && !event.start))
						return this.findIfUpcomingIsCurrent(upcoming);

					var now=moment();

					if (!now.isBetween(moment(event.start),moment(event.end),null,"[]"))
					{
						event=null;
						event = this.findIfUpcomingIsCurrent(upcoming);
					}
					return event;
				},

				cleanUpcomingEvents : function (upcoming)
				{
					
					while (upcoming && upcoming.length && this.checkUpcomingExpired(upcoming[0])==true)
						upcoming.shift();
					return upcoming;
				},

				checkUpcomingExpired : function (event)
				{
					var now=moment();
            		if (!now.isBefore(event.start))
            		{
            			return true;
            		}
            		return false;
				},

				findIfUpcomingIsCurrent : function (upcoming)
				{
					if (upcoming && upcoming.length){
						var now=moment();
						for (var i in upcoming){
							if (now.isBetween(moment(upcoming[i].start),moment(upcoming[i].end)))
								return upcoming[i];
						}
					};

					return null;
				}
			}
			
		};
	}]);
})(window.angular, window.$cardApi);