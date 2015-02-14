/*=============================================================================
#     FileName: localEvent.js
#         Desc: An attempt for event-driven javascript in browsers, 
#               with namespacing support and newListener and removeListener events built in.
#       Author: latel
#        Email: latelx64@gmail.com
#     HomePage: http://kezhen.info/
#          See: http://kezhen.info/project/localevent
#      Version: 0.0.1
#   LastChange: 2014-07-28 15:50:41
#          API: listenTo..
#               listenToOnce..
#               addListener..
#               addOnceListener..
#               on..
#               once..
#               addListeners
#               removeListener..
#               off..
#               un..
#               die..
#               removeListeners
#               defineEvent..
#               defineEvents..
#               removeEvent..
#               removeEvents..
#               removeAllEvents..
#               setMaxListeners..
#               setOnceSignal..
#               getOnceSignal..
#               trigger..
#               getListeners
#        Usage: ------------------------------------
#               # By Instance #
#               var events = new LocalEvent(false);
#               events.setMaxListeners(20);
#               events.listenTo("readyStateChange", function(readyState) {
#                   // your working code
#               });
#               events.trigger("readyStateChange", "interactive");
#               events.removeEvent("readyStateChange");
#               # By Extend #
#               ------------------------------------
#               var Matrix = function() {
#                   LocalEvent.call(this);
#               };
#               // you should use your own method to inherbit the protos
#               // to your class, for here, we just make it the same
#               // special notice that properties and methods with __ prefix(private) shall not be herbited.
#               Matrix.prototype = new LocalEvent();
#               Matrix.prototype.constructor = Matrix;
#               ------------------------------------
#               now class Matrix also have the same API inherbitd from LocalEvent.
#      History: 2014-07-15
#               localEvent is now in development.
#               2014-07-28
#               Initial Release
=============================================================================*/
 
(function(global) {
    "use strict";

    // define some CONST
    var VERSION = "0.0.1",
        UNDEFINED = typeof undefined,
        LOCALEVENT = window.LocalEvent;

    // define some shortchut
    var hasOwn = Object.prototype.hasOwnProperty,
        toString = Object.prototype.toString,
        slice = Array.prototype.slice,
        rslash = /\/$/,
        proto;

    /**
     * LocalEvent class
     *
     * @class LocalEvent
     * @constructor
     * @param  {String} mode    Indicate whether to create a new event type when it is not existed
     * @param  {Object} events  Init with a pre-defined events Object
     * @return {Object} LocalEvent instance
     */
    var LocalEvent = function (mode, events) {
        this._maxListeners = 0;
        this._events = {
            "newListener": [],
            "removeListener": []
        };
        this._mode = typeof mode === "boolean"? mode : (mode === "negative"? false : true);
        this._onceSignal = true;

        if (LocalEvent.type(events) === "Object") {
            this.listensTo(events);
        }
    };

    proto = LocalEvent.prototype;

    /**
     * Get events hash
     *
     * @method _getEvents
     * @access protected
     * @return {Object} Current events hash
     */
    proto._getEvents = function() {
        return this._events;
    };

    /**
     * Get listeners as Object
     *
     * @method _getListenersAsObject
     * @access protected
     * @param  {String|RegExp} evt Name of events to draw listeners from
     * @param  {Boolean}       sn  Wether to draw sub-namespace as well
     * @return {Object} Current events hash meets given filter
     */
    proto._getListenersAsObject = function(evt, sn) {
        var events = this._getEvents(),
            type = LocalEvent.type(evt), 
            response = {},
            i;

        if (type === "String") {
            evt = evt.replace(rslash, "");
            if (!(response[evt] = events[evt]) && (this._mode === false || !(response[evt] = events[evt] = []))) {
                // create new event only if this._mode is set to positive(true)
                delete response[evt];
            }

            if (sn !== false) {
                evt = new RegExp("^" + evt + "\/", i);
                type = "RegExp";
            }
        }

        if (type === "RegExp") {
            for (i in events) {
                if (hasOwn.call(events, i) && !response[i] && evt.test(i)) {
                    response[i] = this._events[i];
                }
            }
        }

        return response;
    };

    /**
     * Wrapper of _getListenersAsObject, make it easy to loop over the
     * original listener functions
     *
     * @method _getListenersAsFlat
     * @access protected
     * @param  {String|RegExp} evt Name of events to draw listeners from
     * @param  {Boolean}       sn  Wether to draw sub-namespace as well
     * @return {Object} Flattened current events hash meets given filter
     */
    proto._getListenersAsFlat = function(evt, sn) {
        var listeners = this._getListenersAsObject(evt, sn),
            response = {},
            i, len, key;

        for (key in listeners) {
            if (hasOwn.call(listeners, key)) {
                response[key] = [];
                for (i = 0, len = listeners[key].length; i < len; i++) {
                    response[key].push(listeners[key][i].listener);
                }
            }
        }

        return response;
    };

    /**
     * Set the max listeners each event type could have at most,
     * for performance consideration.
     *
     * @method setMaxListeners
     * @access public
     * @param  {Number} max  The max listener number that can be registered per event, 0 for inifinite
     * @return {Object} Current LocalEvent instance for chaining
     */
    proto.setMaxListeners = function(max) {
        if (LocalEvent.type(max) === "Number" && max > 1) {
            this._maxListeners = max;
        }

        return this;
    };

    /**
     * Set onceSignal, if a listener returns a value that strict equal to this value,
     * then it will be removed after fired
     * be aware that using variable other than null, undefined, string and number is always confusing
     *
     * @method setOnceSignal
     * @access public
     * @param  {Mixed}  sig  Define the signal
     * @return {Object} Current LocalEvent instance for chaning
     */
    proto.setOnceSignal = function(sig) {
        this._onceSignal = sig;
        
        return this;
    };

    /**
     * Get onceSignal
     *
     * @method getOnceSignal
     * @access public
     * @return {Mixed} Current onceSignal
     */
    proto.getOnceSignal = function() {
        return this._onceSignal;
    };

    /**
     * Add unique event into the events hash
     * if specialfied event already existsed, this operation will be ignored
     * This is useful when you are using addListeners with regexp
     *
     * @method defineEvent
     * @access public
     * @param  {String|RegExp|Array} Names of event(s) to be added
     * @return {Object} Current LocalEvent instance for chaining
     */
    proto.defineEvent = function() {
        var events = this._getEvents(),
            i, j, len, len2, evt;

        for (i = 0, len = arguments.length; i < len; i++) {
            evt = arguments[i];

            switch (LocalEvent.type(evt)) {
            case "String":
                !events[evt] && (events[evt] = []);
                break;

            case "Array":
                for (j = 0, len2 = evt.length; j < len2; j++) {
                    this.defineEvent(evt[j]);
                }
                break;
            }
        }

        return this;
    };

    /**
     * Just a wrapper of defineEvents
     *
     * @method defineEvents
     * @access public
     */
    proto.defineEvents = proto.defineEvent;

    /**
     * remove a event or events in a bulk
     * all listeners selected will be dropped as well
     *
     * @method removeAllEvent
     * @access public
     * @param  {String|Array|RegExp}  Name(s) of event(s) to be removed
     * @return {Object}  Current LocalEvent instance for chaining
     */
    proto.removeEvent = function() {
        var events = this._getEvents(), 
            evt, type, i, j, len, len2;

        for (i = 0, len = arguments.length; i < len; i++) {
            evt = arguments[i];
            type = LocalEvent.type(evt);

            switch (type) {
            case "String":
                evt = evt.replace(rslash, "");
                delete events[evt];
                evt = new RegExp("^" + evt + "\/", "i");

            case "RegExp":
                for (j in events) {
                    if (hasOwn.call(events, j)) {
                        evt.test(j) && (delete events[j]);
                    }
                }
                break;

            case "Array":
                for (j = 0, len2 = evt.length; j < len2; j++) {
                    this.removeEvent(evt[j]);
                }
                break;
            }
        }

        return this;
    };

    /**
     * Just a wrapper of removeEvent
     *
     * @method removeAllEvents
     * @access public
     */
    proto.removeEvents = proto.removeEvent;

    /**
     * remove all events
     *
     * @method removeAllEvent
     * @access public
     * @return {Object} Current LocalEvent instance for chaining
     */
    proto.removeAllEvent = function() {
        this._events = {};

        return this;
    };

    /**
     * Add a listener to the events hash index, according to the givern filter
     *
     * @method listenTo
     * @access public
     * @param  {String|RegExp} evt      Names of event(s) to listen to
     * @param  {Function}      listener Actual listener or that wrappered with once property
     * @return {Object} Current LocalEvent instance for chaining
     */
    proto.listenTo = function(evt, listener) {
        var events,
            listeners,
            islistenerWrappered,
            key;

        islistenerWrappered = LocalEvent.type(listener) === "Object";

        if (!islistenerWrappered && LocalEvent.type(listener) !== "Function") {
            return this;
        }

        events = this._getEvents();
        listeners = this._getListenersAsFlat(evt, false);

        for (key in listeners) {
            if (hasOwn.call(listeners, key) && (this._maxListeners === 0? 1 : events[key].length < this._maxListeners) && LocalEvent.indexOf(listeners[key], islistenerWrappered ? listener.listener : listener) === -1) {
                events[key].push(islistenerWrappered? listener: {
                    "listener" : listener,
                    "once"     : false
                });

                // we are sure, slice can get a proper listener fn as it has been added above
                this.trigger("newListener", key, events[key].slice(-1)[0].listener);
            }
        }

        return this;
    };

    /**
     * Wrapper of listenTo
     *
     * @method addListener
     * @access public
     */
    proto.addListener = proto.listenTo;

    /**
     * Wrapper of listenTo
     *
     * @method on
     * @access public
     */
    proto.on = proto.listenTo;

    /**
     * Add a listener to the events hash index which will be removed
     * the first time it is fired
     *
     * @method listensTo
     * @access public
     * @param  {String|RegExp} evt      Names of events to add a once listener to
     * @param  {Function}      listener Actual listener or that wrappered with once property
     * @return {Object} Current LocalEvent instance for chaining
     */
    proto.listenToOnce = function(evt, listener) {
        if (LocalEvent.type(listener) !== "Function") {
            return this;
        } 
        else {
            return this.listenTo(evt, {
                "listener" : listener,
                "once"     : true
            });
        }
    };

    /**
     * Wrapper of listenTo
     *
     * @method once
     * @access public
     */
    proto.once = proto.listenToOnce;

    /**
     * Adds listeners in bulk
     *
     * @method listensTo
     * @access public
     */
    proto.listensTo = function(evt, listeners) {
    };

    /**
     * Wrapper of listensTo
     *
     * @method addListeners
     * @access public
     */
    proto.addListeners = proto.listensTo;

    /**
     * Remove a listener from events hash index according to the given filter
     *
     * @method removeListener
     * @access public
     * @param  {String|RegExp}   evt      Names of event(s) to remove listener from
     * @param  {Function|Object} listener Real listener or object wrappered with once property
     * @return {Object} Current LocalEvent instance for chaining
     */
    proto.removeListener = function(evt, listener) {
        var events,
            listeners,
            listener,
            key,
            i;

        if (LocalEvent.type(listener) !==  "Function") {
            return this;
        }

        events = this._getEvents();
        listeners = this._getListenersAsFlat(evt);

        for (key in listeners) {
            if (hasOwn.call(listeners, key) && (i = LocalEvent.indexOf(listeners[key], listener)) !== -1) {
                listener = events[key][i];
                this.trigger("removeListener", key, listener);
                events[key].splice(i, 1);
            }
        }

        return this;
    };

    /**
     * Wrapper of removeListener
     *
     * @method off
     * @access public
     */
    proto.off = proto.removeListener;

    /**
     * Wrapper of removeListener
     *
     * @method un
     * @access public
     */
    proto.un = proto.removeListener;

    /**
     * Wrapper of removeListener
     *
     * @method die
     * @access public
     */
    proto.die = proto.removeListener;

    /**
     * remove listeners in bulk
     *
     * @method removeListeners
     * @access public
     */
    proto.removeListeners = function() {
    };


    /**
     * Trigger a list of listeners that matchs given filter,  
     * if you pass evt as a regular expression, all events that matchs will be fired.  
     * otherwise it shall only be a string, in this case, only the event itself or events
     * that belongs to this namespace will be fired.  
     * listeners that have once=true or returns pre-defined _onceReturnValue property 
     * will be removed after fired for the first time.
     *
     * @method trigger
     * @access public
     * @param  {String|RegExp} evt Indicate which listeners shall be fired
     * @return {Object} Current LocalEvent instance for chaining
     */
    proto.trigger = function(evt, args) {
        
        var args = LocalEvent.type(args) === "Array"? args : slice.call(arguments).slice(1), // pass through the exact arguments
            listeners = this._getListenersAsObject(evt, "rw"),
            listener,
            key, 
            signal,
            i; 

        for (key in listeners) {
            if (hasOwn.call(listeners, key) && LocalEvent.type(listeners[key] === "Array")) {
                i = listeners[key].length;
                while (i--) {
                    listener = listeners[key][i];

                    signal = listener.listener.apply(this, args || []);

                    if (listener.once === true || signal === this._onceSignal) {
                        this.removeListener(key, listener.listener);
                    }
                }
            }
        }

    };

    /**
     * Get listeners
     *
     * @method getListeners
     * @access public
     * @param  {String|RegExp} evt Names of events to draw listeners from
     * @return {Object} Current events hash meets given filter
     */
    proto.getListeners = function(evt) {
        var listeners = this._getListenersAsObject();
    };




    // Get a variable's real type
    LocalEvent.type = function(t) {
        return undefined === t? "Undefined" : (toString.call(t).slice(8, -1) || null);
    };

    // Find the index of needle in hay, using Array.prototype.indexOf in flavor
    LocalEvent.indexOf = (function() {
        return Array.prototype.indexOf?
            function(hay, needle) {
                return hay.indexOf(needle);
            } :
            function(hay, needle) {
                var i = 0, 
                    len = hay.length;

                if (LocalEvent.type(hay) !== "Array") {
                    return -1;
                }

                for (; i < len; i++) {
                    if (hay[i] === needle) {
                        return i;
                    }
                }

                return -1;
            };
    })();

    // Restore the original LocalEvent in case of overwrite
    LocalEvent.noConflict = function() {
        if (global.LocalEvent === LocalEvent) {
            global.LocalEvent = LOCALEVENT;
        }
    };


    // Expose the version
    LocalEvent.version = VERSION;

    // Expose self respect to the environment
    if (typeof define === "function") {
        // AMD loader as a anonymous module
        define(function() {
            return LocalEvent;
        });
    }
    else if (typeof exports === 'object') {
        // CommonJS
        exports.LocalEvent = LocalEvent;
    }

    // Always expose to global
    global.LocalEvent = LocalEvent;

})(this);

/*=============================================================================
#     FileName: manSlider.js
#         Desc: Simply another useful slider.
#       Author: latel
#        Email: latelx64@gmail.com
#     HomePage: http://kezhen.info/
#      Version: 0.0.1
#   LastChange: 2014-09-03 14:44:28
=============================================================================*/

(function($, LocalEvent) {

    // environment detection
    if ("undefined" === typeof $) {
        throw ("jQuery is required by manSlider");
    }
    if ("undefined" === typeof LocalEvent) {
        throw ("LocalEvent is required by manSlider");
    }

    // private settings and variables
    var prefix = "manSlider-",
        hasPrefix = new RegExp("^" + prefix.replace("-", ""));

    // private helper functions
    var toString = Object.prototype.toString,
        isFunction = function(fn) {
            return toString.call(fn) === "[object Function]"? true : false;
        },
        isArray = function(arr) {
            return toString.call(arr) === "[object Array]"? true : false;
        },
        isInteger = function(i) {
            return "number" === typeof i? true : false;
        },
        isString = function(str) {
            return "string" === typeof str? true : false;
        },
        isBoolean = function(bl) {
            return "boolean" === typeof bl? true : false;
        },
        inArray = function (needle, haystack, offset) {
            var len;
            if (!isArray(haystack))
                return -1;
            else
                len = haystack.length;

            offset = offset ? offset < 0 ? Math.max(0, len + offset) : offset : 0;

            for (; offset < len; offset++) {
                if (haystack[offset] === needle) 
                    return offset; 
            }
            return -1;
        };

    /**
     * manSlider Class with useful APIS and helper functions.
     *
     * @class ManSliderFactory
     * @constructor
     * @param  {Object}  descriptor  an object with parsed options
     * @return {Object}  manSlider instance
     */
    var ManSliderFactory = function (descriptor) {
        LocalEvent.call(this);

        // validate descriptor and struct configs
        if (!descriptor.$view instanceof $) {
            return false;
        }
        this.__$view = descriptor.$view;
        this.__theme = descriptor.theme;
        this.__min = descriptor.min;
        this.__max = descriptor.max;
        this.__orientation = descriptor.orientation;
        this.__range = descriptor.range;
        this.__step = descriptor.step;
        this.value = descriptor.value;

        // bind initial listener
        this.slide(descriptor.slide);
        this.change(descriptor.change);

        // states
        this.__states = {
            eventsBind: false
        };

        // apply styles
        this.__construct();
        this.__render(this.value, true);
        this.enable();
    };

    ManSliderFactory.poto = ManSliderFactory.prototype = new LocalEvent();

    /*
     * manipulate doms and styles for a slider container.
     * @method __construct
     * @access private
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.__construct = function() {
        var clazz, 
            $handle, clazzHandle, 
            $range, clazzRange,
            i;

        this.__$view.empty();

        // apply styles
        clazz = prefix.replace(/-$/, "") + " ";
        clazz += prefix + this.__theme + " ";
        clazz += prefix + this.__orientation + " ";

        this.__$view.addClass(clazz);

        clazzHandle = prefix + "handle ";
        clazzHandle += prefix + "state-default ";

        this.__$view.append('<span class="' + clazzHandle + '"></span>');
        this.__$handle = this.__$view.find("span");

        clazzRange = prefix + "range ";
        if (this.__range) {
            clazzRange += prefix + "range-" + this.__range + " ";
        }

        this.__$view.append('<div class="' + clazzRange + '"></div>');
        this.__$range = this.__$view.find("div");
        if (!this.__range) {
            this.__$range.css("display", "none");
        }

        return this;
    };

    /**
     * Bind proper events on current slider.
     * @method __bindEvents
     * @access private
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.__bindEvents = function() {
        var self = this;

        $(document).bind("mouseup.manslider", function(ev) {
            $(document).unbind("mousemove.manslider");
        });

        this.__$view.bind("mousedown", function(ev) {
            if (ev.which !== 1) {
                return; 
            }

            $(document).bind("mousemove.manslider", function(ev) {
                ManSliderFactory.__sliderMouseDown.call(self, ev);
                self.trigger("slide");
            });

            ManSliderFactory.__sliderMouseDown.call(self, ev);
        });

        return this;
    };

    /**
     * Unbind events on current slider.
     * @method __unBindEvents
     * @access private
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.__unBindEvents = function() {
        this.__$view.unbind("mousedown");
        this.__$handle.unbind("mousedown");
        $(document).unbind("mousemove.manslider").unbind("mouseup.manslider");

        return this;
    };

    /**
     * Render the handle's position and rang's scale.
     * @method __render
     * @access private
     * @param  {Float}   val  percenrage, value?
     * @param  {Boolean} vop  indicate whether this is a percentage[defult] for render or actual value
     * @return {Void}
     */
    ManSliderFactory.poto.__render = function(val, vop) {
        var percentage;

        if (vop) {
            percentage = 100 * (+val - this.__min)/(this.__max - this.__min);
        }
        else {
            percentage = val;
        }

        if (this.__range === "max") {
            if (this.__orientation === "horizontal") {
                this.__$range.css("width", (100 - percentage) + "%");
            }
            else {
                this.__$range.css("height", (100 - percentage) + "%");
            }
        }
        else {
            if (this.__orientation === "horizontal") {
                this.__$range.css("width", percentage + "%");
            }
            else {
                this.__$range.css("height", percentage + "%");
            }
        }

        if (this.__orientation === "horizontal") {
            this.__$handle.css("left", percentage + "%");
        }
        else {
            this.__$handle.css("bottom", percentage + "%");
        }
    };

    /**
     * Get the current value of a slider.
     * @method get
     * @access public
     * @return {Intger} Current value
     */
    ManSliderFactory.poto.get = function() {
        this.trigger("getValue", this.value);
        return this.value;
    };

    /**
     * Set the current value of a slider.
     * @method set
     * @access public
     * @param  {Intger}  val  current value
     * @param  {Boolean} donotTrigger  whether to trigger the change callback
     * @return {Object}  Current manSlider instance for chaining
     */
    ManSliderFactory.poto.set = function(val, donotTrigger) {
        var old = this.value;

        if ("number" === typeof val) {
            if (val < this.__min) {
                val = this.__min;
            }
            else if (val > this.__max) {
                val = this.__max;
            }
            else {
                // if step is defined, consider nearest appropriate one
                if ("number" === typeof this.__step && this.__step !== 0) {
                    val = this.__min + this.__step * +((val - this.__min)/this.__step).toFixed();
                }
            }

            if (val !== old) {
                this.value = val;
                this.__render(val, true);
                if (false !== donotTrigger) {
                    this.trigger("change", val);
                }
            }
        }

        return this;
    };

    /**
     * Get the dom of current slider.
     * @method dom
     * @access public
     * @param  {Mixed}  orig  if provied, then jQuery wrapper will be pealed
     * @return {Void}
     */
    ManSliderFactory.poto.dom = function(orig) {
        return orig? this.__$view[0] : this.__$view;
    };

    /**
     * Destory a slider.
     * @method destory
     * @access public
     * @return {Void}
     */
    ManSliderFactory.poto.destory = function() {
        var self = this;

        this.__$view.empty();
        $.each(this.__$view.attr("class").split(" "), function(i, clazz) {
            if (hasPrefix.test(clazz)) {
                self.__$view.removeClass(clazz);
            }
        });

        this.trigger("destory", this.__$view);
    };

    /**
     * Change a slider into interactive mode.
     * @method enable
     * @access public
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.enable = function() {
        if (this.__states.eventsBind === false) {
            this.__bindEvents();
            this.__states.bindEvents = true;
            this.trigger("eventsBind");
        }

        return this;
    };

    /**
     * Temporarily disable a slider.
     * @method disable
     * @access public
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.disable = function() {
        this.__unBindEvents();
        this.__states.bindEvents = false;
        this.trigger("eventsUnbind");

        return this;
    };

    /**
     * Add a change listener to current slider instance.
     * @method change
     * @access public
     * @param  {Function} fn  listener function
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.change = function(fn) {
        this.listenTo("change", fn);
        return this;
    };

    /**
     * Add a slide listener to current slider instance.
     * @method slide
     * @access public
     * @param  {Function} fn  listener function
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.slide = function(fn) {
        this.listenTo("slide", fn);
        return this;
    };

    /**
     * Change the current max value
     * @method max
     * @access public
     * @param {Number} max  Newer max value, must larger than min
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.max = function(max) {
        if (max > this.__min) {
            if (this.value > max) {
                this.value = max;
            }
            this.__max = max;
            this.__render(this.value, true);
        }

        return this;
    };

    /**
     * Change the current min value
     * @method min
     * @access public
     * @param {Number} min  Newer min value, must miner than max
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.min = function(min) {
        if (min < this.__max) {
            if (this.value < min) {
                this.value = min;
            }
            this.__min = min;
            this.__render(this.value, true);
        }

        return this;
    };

    /**
     * Events that will be binded to slider when mousedown events triggered.
     * @method sliderMouseDown
     * @type   static
     * @access private
     * @return {Void}
     */
    ManSliderFactory.__sliderMouseDown = function(ev) {
        var old = this.value, current,
            sliderPosition = this.__$view.offset(),
            sliderWidth = this.__$view.width(),
            sliderHeight = this.__$view.height(),
            relPosition = {
                top: ev.pageY - sliderPosition.top,
                left: ev.pageX - sliderPosition.left
            },
            percentage;

        if (this.__orientation === "horizontal") {
            percentage = 100 * relPosition.left/sliderWidth;
        }
        else {
            percentage = 100 * (1 - relPosition.top/sliderHeight);
        }
        percentage = Math.max(0, percentage);
        percentage = Math.min(100, percentage);

        current = this.__min + percentage * (this.__max - this.__min)/100;
        if ("number" === typeof this.__step && percentage !== 0 && percentage !== 100) {
            current = this.__min + this.__step * +((current - this.__min)/this.__step).toFixed();
        }

        if (old !== current) {
            percentage = 100 * (current - this.__min)/(this.__max - this.__min);
            this.value = current;
            this.__render(percentage);
            this.trigger("change", current);
        }
    };

    /**
     * Events that will be binded to handle when mousedown events triggered.
     * @method handleMouseDown
     * @type   static
     * @access private
     * @return {Void}
     */
    ManSliderFactory.__handleMouseDown = function() {
        ManSliderFactory.__sliderMouseDown.call(this);
    };


    // extend interface to jQuery prototype
    $.fn.manSlider = function(options) {
        var manSliders = [],
            options = $.extend({}, $.fn.manSlider.defaults, options);

            options.theme = "string" === typeof options.theme? options.theme : $.fn.manSlider.defaults.theme;

            options.min = "number" === typeof options.min? options.min : $.fn.manSlider.defaults.min;
            options.max = "number" === typeof options.max? options.max : options.min + 100;
            if (options.min > options.max) {
                options.min = [options.max, options.max = options.min][0];
            }

            options.orientation = -1 !== inArray(options.orientation, ["horizontal", "vertical"])? options.orientation : $.fn.manSlider.defaults.orientation;

            options.range = -1 !== inArray(options.range, ["min", "max", true])? options.range : undefined;

            options.step = "number" === typeof options.step? Math.abs(options.step) : undefined;

            options.value = ("number" === typeof options.value && options.value >= options.min && options.value <= options.max)? options.value : options.min;

        this.each(function(index, el) {
            options.$view = $(this);

            manSliders.push(new ManSliderFactory(options));
        });

        return manSliders.length > 1? manSliders : manSliders[0];
    };

    // expose plugin defaults
    $.fn.manSlider.defaults = {
        orientation: "horizontal",
        min: 0,
        max: 100,
        value: 0,
        theme: "white"
    };

}(this.jQuery, this.LocalEvent));

