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
     * @return {Object} Current manSlider instance for chaining
     */
    ManSliderFactory.poto.set = function(val) {
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
                this.trigger("change", val);
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


    // extend interface to jQuert prototype
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

}(window.jQuery, window.LocalEvent));

