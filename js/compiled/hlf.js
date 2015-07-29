;(function ($, _, context) {
    'use strict';

    var hlf = function() {

        var config = {
            asGoalUrl: (location.protocol == 'file:' ? 'http:' : '') + '//metrics.aviasales.ru',
            mobileMode: mobileDetect(),

        };

        /** Check mobile verison **/

        function mobileDetect(){
            var x = document.createElement('input'); x.setAttribute('type', 'date');
            if (x.type == 'date' && device.mobile()){return true}else{return false}
        }

        /**
         * Check google analytics (GA) exists on page
         * @returns {boolean|*}
         */
        function gaExists() {
            return typeof ga !== 'undefined' && _.isFunction(ga);
        }

        /**
         * Send goal to GA
         * @param goal ['category', 'name']
         * @returns {boolean}
         */
        function gaGoal(goal) {
            if(gaExists() && typeof goal !== 'undefined' && _.isArray(goal) && goal.length) {
                ga('send', 'event', goal[0], goal[1]);
                return true;
            }
            return false;
        }

        /**
         * Return ga linkerParam for cross domain linking
         * @returns string todo wtf? obj needed
         */
        function gaGetLinkerParam() {
            var str = null;
            if(gaExists()) {
                // collect cross domain linker
                ga(function (tracker) {
                    str = tracker.get('linkerParam');
                });
            }
            return str;
        }

        /**
         * Its yandex metrika
         * @type {object}
         */
        var yam = null;

        /**
         * Check yandex metrika exists on page
         * @returns {boolean}
         */
        function yamExists() {
            if(!yam && typeof Ya !== 'undefined') {
                _.each(Ya._metrika.counters, function(v){
                    yam = v;
                    return;
                });
            }
            return !!yam;
        }

        /**
         * Send goal to yam
         * @param goal 'goal-name'
         * @returns {boolean}
         */
        function yamGoal(goal) {
            if(yamExists() && _.isString(goal) && goal.length) {
                yam.reachGoal(goal);
                return true;
            }
            return false;
        }

        /**
         * Send goal to aviasales
         * @param goal 'goal-name'
         * @param d any json
         * @returns {boolean}
         */
        function asGoal(goal, d) {
            if(_.isString(goal) && goal.length) {
                $.ajax({
                    url: config.asGoalUrl,
                    type: 'get',
                    dataType: 'jsonp',
                    data: {
                        goal: goal,
                        data: JSON.stringify(d)
                    }
                });
                return true;
            }
            return false;
        }

        function goal(goals, data) {
            yamGoal(goals.yam || null);
            gaGoal(goals.ga ? goals.ga.split('.') : null);
            asGoal(goals.as || null, data);
        }

        return {
            gaGetLinkerParam: gaGetLinkerParam,
            goal: goal,
            config: config,
            jst: {} // js templates
        }

    }();

    function paramsParse(str) {

        var digitTest = /^\d+$/,
            keyBreaker = /([^\[\]]+)|(\[\])/g,
            plus = /\+/g;

        var data = {},
            pairs = str.split('&'),
            current,
            lastPart = '';

        for (var i = 0; i < pairs.length; i++) {
            current = data;
            var pair = pairs[i].split('=');

            // if we find foo=1+1=2
            if (pair.length != 2) {
                pair = [pair[0], pair.slice(1).join("=")]
            }

            try {
                var key = decodeURIComponent(pair[0].replace(plus, " ")),
                    value = decodeURIComponent(pair[1].replace(plus, " ")),
                    parts = key.match(keyBreaker);
            }
            catch (err) {
                parts=null;
            }

            if (parts !== null) {
                for (var j = 0; j < parts.length - 1; j++) {
                    var part = parts[j];
                    if (!current[part]) {
                        // if what we are pointing to looks like an array
                        current[part] = digitTest.test(parts[j + 1]) || parts[j + 1] == "[]" ? [] : {}
                    }
                    current = current[part];
                }
                lastPart = parts[parts.length - 1];
                if (lastPart == "[]") {
                    current.push(value)
                } else {
                    current[lastPart] = value;
                }
            }
        }

        return data;

    }

    hlf.getTpl = function (name) {
        return _.template(hlf.jst[name + '.jst'].main());
    };

    hlf.getEl = function($c, role, name) {
        var selector = '[hlf-role="' + role + '"]';
        if(name) {
            selector += '[hlf-name="' + name +'"]';
        }
        return $c.find(selector);
    };

    hlf.getContainer = function($c, place, value) {
        return $c.find('[hlf-' + place + '="' + value + '"]');
    };

    hlf.readCookie = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    };
    /**
     * GET params
     * @param n
     * @returns {*|null}
     * @constructor
     */
    hlf.GET = function(n) {
        var data = paramsParse(location.search.substring(1));
        return n ? (data[n] || null) : data;
    };

    /**
     * Working with cookie
     * @param n name
     * @returns {T}
     * todo deprecated
     */
    hlf.cookie = function (n) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + n + "=");
        if (parts.length == 2) { // todo its mistake
            return parts.pop().split(";").shift();
        }
    };

    context.hlf = hlf;

})(jQuery, _, this);
this["hlf"] = this["hlf"] || {};
this["hlf"]["jst"] = this["hlf"]["jst"] || {};
this["hlf"]["jst"]["ac.input.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"hlf-input hlf-input--ac\" hlf-role=\"input-wrap\">\n    <input type=\"text\"\n           placeholder=\"<%= placeholder %>\"\n           value=\"<%= text %>\"\n           tabindex=\"<%= tabIndex %>\"\n           hlf-role=\"input\"/>\n    <div class=\"icon-load\" hlf-role=\"loader\"></div>\n    <i class=\"icon-close\" hlf-role=\"close\"></i>\n    <div class=\"hint\" hlf-role=\"hint\"><%= hint %></div>\n</div>";
  },"useData":true};
this["hlf"]["jst"]["ac.samples.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"hlf-input--ac-samples\" hlf-role=\"samples\"><%= samplesText %></div>";
  },"useData":true};
this["hlf"]["jst"]["ac.samplesLink.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<a href=\"#\" hlf-role=\"samples-link\" data-type=\"<%= type %>\" data-id=\"<%= id %>\" data-text=\"<%= text %>\"><%= sample %></a>";
  },"useData":true};
this["hlf"]["jst"]["calendar.head.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"ui-datepicker-head\"><%= head %></div>";
  },"useData":true};
this["hlf"]["jst"]["calendar.input.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"hlf-input hlf-input--calendar\" hlf-role=\"input-wrap\">\n    <% if (inline) { %>\n        <div hlf-role=\"input\" /></div>\n    <% } else { %>\n        <input type=\"text\" placeholder=\"<%= placeholder %>\" tabindex=\"<%= tabIndex %>\" hlf-role=\"input\" height=\"60\"  />\n    <% } %>\n    <div class=\"hint\" hlf-role=\"hint\"></div>\n    <div class=\"pseudo-placeholder\" hlf-role=\"placeholder\"><%= placeholder %></div>\n</div>";
  },"useData":true};
this["hlf"]["jst"]["calendar.legend.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"ui-datepicker-legend\">\n    <div class=\"ui-datepicker-legend-head\"><%= legend %></div>\n    <div class=\"ui-datepicker-legend-points\">\n        <div class=\"ui-datepicker-legend-points-line\"></div>\n        <ul class=\"ui-datepicker-legend-points-list\">\n            <% _.each(points, function(point, i) { %>\n            <li class=\"ui-datepicker-legend-points-item ui-datepicker-legend-points-item--<%= i %>\"><%= point %></li>\n            <% }); %>\n        </ul>\n    </div>\n</div>";
  },"useData":true};
this["hlf"]["jst"]["guests.child.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<li class=\"hlf-guests-children-item\" hlf-role=\"child-container\" hlf-name=\"<%= key %>\">\n    <div class=\"hlf-guests-child-age-title\">\n        <%= title %>\n        <div  class=\"hlf-guests-child-age-hint\"><%= hint %></div>\n    </div>\n    <div class=\"hlf-guests-child-age-controls\">\n        <% if (childValSep) { %>\n            <div class=\"hlf-guests-child-age-val\">\n                <span hlf-role=\"child-age\"><%= age %></span>\n            </div>\n            <div class=\"hlf-guests-child-controls\">\n                <a class='hlf-control' href=\"#\" hlf-role=\"child-age-decrement\"><%= decControlContentChld %>︎</a>\n                <a class='hlf-control' href=\"#\" hlf-role=\"child-age-increment\"><%= incControlContentChld %></a>\n            </div>\n        <% } else { %>\n            <a class='hlf-control' href=\"#\" hlf-role=\"child-age-decrement\"><%= decControlContentChld %>︎</a>\n            <div class=\"hlf-guests-child-age-val\">\n                <span hlf-role=\"child-age\"><%= age %></span>\n            </div>\n            <a class='hlf-control' href=\"#\" hlf-role=\"child-age-increment\"><%= incControlContentChld %></a>\n        <% } %>\n    </div>\n</li>";
  },"useData":true};
this["hlf"]["jst"]["guests.container.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"hlf-guests hlf-state--closed\" hlf-role=\"guests\">\n    <a href=\"#\" class=\"hlf-guests-i\" tabindex=\"<%= tabIndex %>\" hlf-role=\"summary\"></a>\n    <div class=\"hlf-guests-dd\" hlf-role=\"controls\">\n        <div class=\"hlf-guests-adults\">\n            <% if (titlesPosInside) { %>\n                <div class=\"hlf-guests-adults-controls\">\n                    <a class='hlf-control' href=\"#\" hlf-role=\"adults-decrement\"><span><%= decControlContent %></span></a>\n                    <div class=\"hlf-guests-adults-val\">\n                        <span hlf-role=\"adults-val\"></span>\n                        <span class=\"hlf-guests-adults-title\"><%= adultsTitle %></span>\n                    </div>\n                    <a class='hlf-control' href=\"#\" hlf-role=\"adults-increment\"><span><%= incControlContent %></span></a>\n                </div>\n            <% } else { %>\n                <div class=\"hlf-guests-adults-title\"><%= adultsTitle %></div>\n                <div class=\"hlf-guests-adults-controls\">\n                    <a class='hlf-control' href=\"#\" hlf-role=\"adults-decrement\"><span><%= decControlContent %></span></a>\n                    <div class=\"hlf-guests-adults-val\" hlf-role=\"adults-val\"></div>\n                    <a class='hlf-control' href=\"#\" hlf-role=\"adults-increment\"><span><%= incControlContent %></span></a>\n                </div>\n            <% } %>\n        </div>\n        <div class=\"hlf-guests-children\">\n            <% if (titlesPosInside) { %>\n                <div class=\"hlf-guests-children-controls\">\n                    <a class='hlf-control' href=\"#\" hlf-role=\"children-decrement\"><span><%= decControlContent %></span></a>\n                    <div class=\"hlf-guests-children-val\">\n                        <span hlf-role=\"children-val\"></span>\n                        <span class=\"hlf-guests-children-title\"><%= childrenTitle %></span>\n                    </div>\n                    <a class='hlf-control' href=\"#\" hlf-role=\"children-increment\"><span><%= incControlContent %></span></a>\n                </div>\n            <% } else { %>\n                <div class=\"hlf-guests-children-title\"><%= childrenTitle %></div>\n                <div class=\"hlf-guests-children-controls\">\n                    <a class='hlf-control' href=\"#\" hlf-role=\"children-decrement\"><span><%= decControlContent %></span></a>\n                    <div class=\"hlf-guests-children-val\" hlf-role=\"children-val\"></div>\n                    <a class='hlf-control' href=\"#\" hlf-role=\"children-increment\"><span><%= incControlContent %></span></a>\n                </div>\n            <% } %>\n            <div class=\"hlf-guests-children-list-title\" hlf-role=\"children-list-title\"><%= childrenListTitle %></div>\n            <ul class=\"hlf-guests-children-list\" hlf-role=\"children-list\"></ul>\n        </div>\n    </div>\n</div>";
  },"useData":true};
this["hlf"]["jst"]["noDates.input.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<label hlf-role=\"noDates-input-wrap\">\n    <input type=\"checkbox\" tabindex=\"<%= tabIndex %>\" hlf-role=\"noDates-input\"><%= text %>\n</label>";
  },"useData":true};
this["hlf"]["jst"]["submit.button.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<button tabindex=\"<%= tabIndex %>\" hlf-role=\"button\"><%= text %></button>";
  },"useData":true};
;(function ($, _, hlf) {
    'use strict';

    /**
     * Form constructor
     * @param config
     * @param noMarker bool dont try to find marker
     * @returns {{controls: {}, param: Function}}
     */
    hlf.form = function (config, noMarker) {

        config = _.defaults(config || {}, {
            id: null,
            controls: {},
            params: {},
            target: '_self',
            hash: null,
            goalSubmit: {}
        });

        var $f = $('[hlf-form="' + config.id +'"]'), // todo check availability
            uid = _.uniqueId(), // form uid
            tabIndex = 1, // controls tabIndex counter
            controls = {};

        // draw each control
        _.each(config.controls, function(c, n) {
            controls[n] = c(n, $f, controls, uid + (tabIndex++) + '');
        });

        // wrap config functions to use controls obj
        _.each(controls, function(control) {
            _.each(control.config, function(value, key) {
                if(_.isFunction(value)) {
                    control.config[key] = _.partialRight(value, controls);
                }
            });
        });

        $f.on('submit', function() {
            var result = true;
            _.each(controls, function(control) {
                if(control.validate && _.isFunction(control.validate)) {
                    result = control.validate();
                }
                return result;
            });
            if(result) {
                // collect controls data
                var p = _.reduce(_.map(controls, function(i) {
                    return _.isFunction(i.getParams) ? i.getParams() : {};
                }), function(result, d) {
                    return _.merge(result, d);
                });

                // additional params if needed
                if(_.isUndefined(config.params.marker) && !noMarker) { // try to find marker in GET, then in cookie
                    var marker = hlf.GET('marker') || hlf.readCookie('marker') || null;
                    if(marker) {
                        config.params.marker = marker;
                    }
                }

                if(_.isUndefined(config.params.hls)) { // try to find hls in GET
                    var hls = hlf.GET('hls') || null;
                    if(hls) {
                        config.params.hls = hls;
                    }
                }

                p = _.merge(p, config.params);

                _.each(p, function(val, key){
                    if (!val || val == null || val == '') {
                        delete p[key];
                    }
                });

                // send required goals
                hlf.goal(config.goalSubmit, {
                    params: p
                });

                var gaLinker = hlf.gaGetLinkerParam();

                window.open (
                    //todo: $f.attr('target') || config.target
                    $f.attr('action') + '/?' +
                    $.param(p) + // controls params
                    (gaLinker ? '&' + gaLinker : '') + // ga linker param
                    (config.hash ? '#' + config.hash : ''), $f.attr('target') || config.target); // hash and target (open in new window or not)
                return false;
            }
            return result;
        });

        return {
            controls: controls,

            /**
             * set/get for params
             *
             * @param name
             * @param value
             * @returns {*}
             */
            param: function (name, value) {
                if(!value) {
                    return config.params[name];
                }
                config.params[name] = value;
            }
        };

    }

})(jQuery, _, hlf);
;(function ($, _, hlf) {
    'use strict';

    hlf.ac = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $h = null, // hint
            $l = null, // loader
            $sc = null, // samples container
            $sl = null, // samples links
            $cl = null, //close button
            controls = {},
            goalUseInputSent = false; // flag means event 'use' sent (prevent multisent)

        config = _.defaults(config || {}, {

            url: (location.protocol == 'file:' ? 'http:' : '') + '//yasen.hotellook.com/autocomplete',
            name: 'destination', // getParams() param name in case
                                 // you select nothing in autocomplete
            className: '',
            text: '', // default input value
            type: '', // default type
            id: 0, // default id
            limit: 5, // limit for items each category
            locale: 'en-US',
            mobileMode: hlf.config.mobileMode,
            autoFocus: false, // auto focus if field is empty
            needLocationPhotos: false,
            locationPhotoSize: '240x75',
            onlyLocations: false,

            placeholder: 'Type something....',
            hint: 'panic!', // this control always required, its hint text
            translateCategory: function(t) {
                return t;
            },
            translateHotelsCount: function(n) {
                return n + ' hotels';
            },

            goalUseInput: {}, // {ga: 'la-la-la.bla-bla', yam: 'sdasds', as: 'something'}
            goalAcSelect: {},
            goalUseSamples: {},
            goalUseClear: {},

            onSelect: function() {}, // select from autocomplete
            onSelectShowCalendar: null,
            onReset: function() {}, // fires when you type something in autocomplete
                                    // and type & id values resets
            avgPricesUrl: (location.protocol == 'file:' ? 'http:' : '') + '//yasen.hotellook.com/minprices/location_year/{id}.json',
            avgPricesCalendars: [], // names if controls
            avgPricesFormatter: function(v) {
                return '' + Math.round(v);
            },

            samplesText: 'For example: {list}',
            samplesList: [], // e.g.:
                             // [
                             //     {id: 15542, type: 'location', text: 'Paris, France', sample: 'Paris'},
                             //     {id: 15298, type: 'location', text: 'Marseille, France', sample: 'Marseille'}
                             // ]

            tplInput: hlf.getTpl('ac.input'),
            tplSamples: hlf.getTpl('ac.samples'),
            tplSamplesLink: hlf.getTpl('ac.samplesLink')

        });

        function avgPricesRequest (id) {
            if(config.avgPricesCalendars.length) {
                _.each(config.avgPricesCalendars, function(name) {
                    if(!_.isUndefined(controls[name])) {
                        controls[name].resetDetails();
                    }
                });
                $.ajax({
                    dataType: 'jsonp',
                    type: 'get',
                    cache: true,
                    url: config.avgPricesUrl.replace('{id}', id),
                    success: avgPricesRequestSuccess
                });
            }
        }

        function avgPricesRequestSuccess(data) {
            if(_.size(data)) {
                var first = null;
                _.each(config.avgPricesCalendars, function(name) {
                    if(!first) {
                        controls[name].specifyDetails(data, config.avgPricesFormatter);
                        controls[name].refresh();
                        first = controls[name];
                    } else {
                        controls[name].setDetails(_.clone(first.getDetails(), true));
                        controls[name].refresh();
                    }
                });
            }
        }

        /**
         * Get params string
         * @returns {object}
         */
        function getParams() {
            var r = {};
            switch(true) {
                case !!(config.id && config.type):
                    r[config.type + 'Id'] = config.id;
                    break;
                case !!config.text:
                    r[config.name] = config.text;
                    break;
                default: break;
            }
            return r;
        }

        function source(request, response) {
            $iw.addClass('hlf-state--loading');
            $.ajax({
                dataType: 'jsonp',
                type: 'get',
                url: config.url,
                data: {
                    lang: config.locale,
                    limit: config.limit,
                    term: request.term
                },
                jsonpCallback: 'hlf_ac_callback',
                success: function(data) {
                    var cities = _.map(data.cities, function(item) {
                        return {
                            id: item.id,
                            category: config.translateCategory('Locations'),
                            type: 'location',
                            value: item.fullname,
                            text: item.city,
                            clar: (item.state ? item.state + ', ' : '') + item.country,
                            comment: config.translateHotelsCount(item.hotelsCount),
                            photo: config.needLocationPhotos ? 'https://photo2.hotellook.com/static/cities/' + config.locationPhotoSize + '/' + item.id + '.auto' : false
                        }
                    });
                    if (!config.onlyLocations) {
                        var hotels = _.map(data.hotels, function (item) {
                            return {
                                id: item.id,
                                category: config.translateCategory('Hotels'),
                                type: 'hotel',
                                value: item.name + ', ' + item.city + ', ' + item.country,
                                text: item.name,
                                clar: item.city + ', ' + item.country
                            }
                        });
                        response(_.union(cities, hotels));
                    } else {
                        response(_.union(cities));
                    }
                    $iw.removeClass('hlf-state--loading');
                },
                error: function() {
                    $iw.removeClass('hlf-state--loading');
                }
            });
        }

        function setValue(id, type, title) {
            config.id = id;
            config.type = !type ? 'location' : type;
            if (title) {
                config.text = title;
                $i.val(title);
            }
        }

        function onReset() {
            _.each(config.avgPricesCalendars, function(name) {
                controls[name].resetDetails();
            });
            config.onReset();
        }

        function select(type, id, text) {
            $iw.removeClass('hlf-state--error');
            config.type = type;
            config.id = id;
            if(text) {
                $i.val(text);
            }
            avgPricesRequest(id);
            config.onSelect(type, id);
            if(config.onSelectShowCalendar) {
                if(!controls[config.onSelectShowCalendar].getStamp() && !config.mobileMode) {
                    controls[config.onSelectShowCalendar].show();
                }
            }
        }

        function validate() {
            if(_.size(getParams())) {
                return true;
            }
            $i.focus();
            $iw.addClass('hlf-state--error');
            return false;
        }

        return function(name, $f, c, ti) {
            if(config.id) {
                avgPricesRequest(config.id);
            }

            controls = c || {};
            config.tabIndex = ti || 0;

            $c = hlf.getContainer($f, 'ac', name);
            $c.html(config.tplInput(config));
            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $h = hlf.getEl($c, 'hint');
            $l = hlf.getEl($c, 'loader');
            $cl = hlf.getEl($c, 'close'); //close button
            config.className&&$iw.addClass(config.className);

            if (_.size(getParams())) {
                $iw.addClass('hlf-state--no-empty');
            };

            $i.reachAutocomplete({
                source: source,
                select: function(ev, data) {
                    select(data.item.type, data.item.id);
                    hlf.goal(config.goalAcSelect, data.item);
                    hlf.goal(config.goalAcSelectType, data.item.type);
                },
                minLength: 3
            });

            $i.on('keyup', function() {
                config.text = $i.val();
                if (!(_.size(getParams())) && $iw.hasClass('hlf-state--no-empty')) {
                    $iw.removeClass('hlf-state--no-empty');
                };

            });

            $i.on('keydown', function(e) {
                // ignore enter & tab key
                if(e.keyCode !== 13 && e.keyCode !== 9) {
                    config.type = '';
                    config.id = 0;
                    onReset();
                }
                if(!goalUseInputSent) {
                    hlf.goal(config.goalUseInput);
                    goalUseInputSent = true;
                }
                $iw.removeClass('hlf-state--error');
                if ($i[0].value!='') {
                    $iw.addClass('hlf-state--no-empty');
                };
            });

            $i.on('focus', function() {
                $c.addClass('hlf-state--focus');
                $iw.addClass('hlf-state--focus');
                $iw.removeClass('hlf-state--error');
                goalUseInputSent = false;
            });

            $i.on('blur', function() {
                $c.removeClass('hlf-state--focus');
                $iw.removeClass('hlf-state--focus');
            });

            $h.on('click', function() {
                $iw.removeClass('hlf-state--error');
            });

            $cl.on('click', function(){
                $i[0].value='';
                $iw.removeClass('hlf-state--no-empty');
                config.type = '';
                config.id = 0;
                onReset();
                config.text='';
                $i.focus();
                hlf.goal(config.goalUseClear);
            });

            if(config.autoFocus && !config.text.length && !device.mobile()) {
                $i.focus();
            }

            if(config.samplesList.length) {

                var links = _.map(config.samplesList, function(i) {
                    return config.tplSamplesLink(i);
                });
                var samples = config.tplSamples(
                    _.defaults({
                        samplesText: config.samplesText.replace('{list}', links.join(', '))
                    }, config)
                );
                $c.append(samples);
                $sc = hlf.getEl($c, 'samples');
                $sl = hlf.getEl($sc, 'samples-link');

                $sl.on('click', function() {
                    var $this = $(this);
                    select($this.data('type'), $this.data('id'), $this.data('text'));
                    hlf.goal(config.goalUseSamples);
                    $iw.addClass('hlf-state--no-empty');
                    return false;
                });

            }

            return {
                config: config,
                select: select,
                getParams: getParams,
                setValue: setValue,
                validate: validate
            };

        };

    };

    // jsonp callback cheat
    function hlf_ac_callback() {}

    /**
     * Extension for jQuery.ui.autocomplete
     */
    $.widget('custom.reachAutocomplete', $.ui.autocomplete, {
        _create: function() {
            this._super();
            this.widget().menu('option', 'items', '> :not(.ui-autocomplete-category)');
        },
        _renderMenu: function( ul, items ) {
            ul.addClass('hlf-ac');
            var that = this,
                currentCategory = "";
            $.each( items, function( index, item ) {
                var li;
                if ( item.category != currentCategory ) {
                    ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
                    currentCategory = item.category;
                }
                li = that._renderItemData( ul, item );
                if ( item.category ) {
                    li.attr( "aria-label", item.category + " : " + item.label );
                }
            });
        },
        _renderItem: function (ul, item) {
            var label = '<span class="ui-menu-item-text">' + item.text + (item.clar ? ', <span class="ui-menu-item-clar">' + item.clar + '</span>' : '') + '</span>';
            if (item.comment)
                label += '<span class="ui-menu-item-comment">' + item.comment + '</span>';
            if (item.photo)
                label += '<img src="' + item.photo + '" class="ui-menu-item-img" />';
            return $("<li>")
                .append($("<a>").html(label))
                .appendTo(ul);
        }
    });

})(jQuery, _, hlf);
;
(function ($, _, hlf) {
    'use strict';

    hlf.calendar = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $h = null, // hint

            controls = {},
            uid = _.uniqueId('hlf.calendar'), /* Unique id for "refresh" cheating.
         * $i.datepicker('widget') returns any opened datepicker,
         * that means we need to mark this calendar with uid
         * to check uid in refresh function */
            details = {}, // day details
            range = {
                'in': null, // if you use relation calendar here is inferior date value
                'out': null // ... and here superior date value
            },
            isAutoShown = false; // it means calendar been shown automatically (not by user)

        config = _.defaults(config || {}, {

            required: false,
            className: '',
            name: 'date', // getParams() param name
            value: null, // default date Date()
            format: 'yy-mm-dd', // getParams() param value format
            min: 0, // min selectable date (in days from today)
            months: (function () {
                if (window.innerWidth <= 700) {
                    return 1
                } else {
                    return 2
                }
            })(), // num of months visible in datepicker
            locale: 'en-US',
            inline: false,
            mobileMode: hlf.config.mobileMode,
            placeholder: 'Choose date...',
            hintEmpty: 'Its required field', // hint text if required calendar field is empty
            head: null, // datepicker head text
            legend: 'Days colored by average price for the night',
            // todo hint text if relation calendar date >30 days
            // hintPeriod: 'period-panica!',

            goalSelectDate: {}, // goal on select date
            onSelect: function () {
            },

            relationCalendar: null, // name of control
            relationSuperior: false, // 1 - superior, 0 - inferior
            relationAutoSet: false,
            relationAutoShow: false,

            tplInput: hlf.getTpl('calendar.input'),
            tplHead: hlf.getTpl('calendar.head'),
            tplLegend: hlf.getTpl('calendar.legend')

        });

        function disable() {
            $i.datepicker('option', 'disabled', true);
            $iw.addClass('hlf-state--disabled');
            $iw.removeClass('hlf-state--error');
        }

        function enable() {
            $i.datepicker('option', 'disabled', false);
            $iw.removeClass('hlf-state--disabled');
        }

        /**
         * Show calendar
         * @param flag it means calendar has been shown automatically (by another control)
         */
        function show(flag) {
            isAutoShown = !!flag;
            if ( config.mobileMode === true ) {
                $i.focus();

            } else {
                setTimeout(function () { // jquery.ui.datepicker show cheat
                    $i.datepicker('show');
                }, 16);
            }

        }

        /**
         * Hide calendar
         */
        function hide() {
            $i.datepicker('hide');
        }

        /**
         * Refresh calendar
         */
        function refresh() {
            var $widget = $i.datepicker('widget');
            if ($widget.is(':visible') && $widget.attr('__cheat') == uid) { // use __cheat to refresh this own calendar
                // because in $widget may be any calendar
                $i.datepicker('refresh');
            }
        }

        /**
         * Adjust relation calendar
         */
        function relationAdjust() {
            var relation = controls[config.relationCalendar];
            // is it has value?
            if (relation && relation.getStamp() && getStamp() && getDate()) {
                // for superior relation set to 1 day more
                if (config.relationSuperior) {
                    if (relation.getStamp() <= getStamp()) {
                        relation.setAnotherDate(getDate(), 1);
                    }
                }
                // for inferior relation set to -1 day
                else {
                    if (relation.getStamp() >= getStamp()) {
                        relation.setAnotherDate(getDate(), -1);
                    }
                }
            }
        }

        /**
         * Auto set relation calendar value
         */
        function relationAutoSet() {

            var relation = controls[config.relationCalendar];
            // auto set value only if there is no value & relationAutoSet = true
            if (relation && !relation.getStamp() && config.relationAutoSet && getDate()) {
                relation.setAnotherDate(getDate(), config.relationSuperior ? 1 : -1);
            }
        }

        /**
         * Auto show relation calendar
         */
        function relationAutoShow(date) {
            var relation = controls[config.relationCalendar];
            if (relation && config.relationAutoShow && !isAutoShown) { // if this calendar has been shown by its
                relation.show(true, date);
            }
        }

        function getStamp() {
            var date=config.mobileMode?$i[0].value:$i.datepicker('getDate');

            if (date) {
                return (new Date(date)).getTime();
            }
            return null;
        }

        function getDate(i) { //argument for this function - input; if function called without argument, it uses the default input

            var input;
            input= i ? i : $i;
            var date;
            date=config.mobileMode?input[0].value:input.datepicker("getDate");
            if (date) {
                return new Date(date);
            }

            return null;
        }

        function setAnotherDate(date, modify) {
            var newDateStamp = new Date();
            newDateStamp.setTime(date.getTime() + ((modify || 0) * 86400000));
            var newDate = new Date(newDateStamp);
            if (config.mobileMode) {
                $i[0].value= dateToString(newDate)
            } else {
                $i.datepicker('setDate', newDate);
            }
            $iw.removeClass('hlf-state--error');
        }

        function validate() {
            if (!config.required || $i.datepicker('option', 'disabled') || _.size(getParams())) {
                return true;
            }
            $iw.addClass('hlf-state--error');
            $h.html(config.hintEmpty);
            return false;
        }

        /**
         * Process each date average price & calculate day details
         * todo fix it strange logic
         * @param data
         * @param formatter function
         */
        function specifyDetails(data, formatter) {
            if (!_.size(data))
                return false;
            var count = 0,
                sum = 0,
                min = 0,
                max = 0;
            _.each(data, function (v) {
                if (!min || v < min)
                    min = v;
                if (!max || v > max)
                    max = v;
                sum += v;
                count++;
            });
            // calculate average and diff with min & max
            var average = sum / count,
                diffMax = max - average,
                diffMin = average - min,
                dates = {};
            _.each(data, function (v, date) {
                // price more than average?
                var diff = v - average,
                    up = true;
                if (diff < 0) {
                    up = false;
                    diff = Math.abs(diff);
                }
                // choose closest position
                var percent = diff * 100 / (up ? diffMax : diffMin),
                    rate = 2;
                if (up) {
                    if (percent > 20)
                        rate = 3;
                    if (percent > 60)
                        rate = 4;
                } else {
                    if (percent > 20)
                        rate = 1;
                    if (percent > 60)
                        rate = 0;
                }
                dates[date] = {
                    'value': v, // average price
                    'rate': rate // rate for this price (0 - cheap, 4 - expensive)
                };
            }, this);
            setDetails({
                dates: dates,
                points: [ // price points for legend
                        average - diffMin * 0.8,
                    average,
                        average + diffMax * 0.8
                ],
                formatter: formatter || function (v) {
                    return v
                }
            });
            return true;
        }

        function setDetails(d) {
            $iw.addClass('hlf-state--detailed');
            details = d;
        }

        function getDetails() {
            return details;
        }

        function resetDetails() {
            $iw.removeClass('hlf-state--detailed');
            details = {};
        }

        /**
         * Returns cfg for each date cell in calendar
         *
         * @param date
         * @returns {*[]}
         */
        function getDayCfg(date) {
            var dateAsStr = $.datepicker.formatDate('yy-mm-dd', date),
                cfg = [true, '', ''];

            // fill cfg with date details
            if (!_.isUndefined(details.dates) && details.dates[dateAsStr]) {
                cfg[1] += ' ui-datepicker-dayType ui-datepicker-dayType--' + details.dates[dateAsStr].rate; // cell class
                cfg[2] = details.formatter(details.dates[dateAsStr].value);
            }

            // fill cfg with range details
            if (controls[config.relationCalendar]) {
                // in range
                cfg[1] += range['in'] && range['out'] && (range['in'].getTime() <= date.getTime() && date.getTime() <= range['out'].getTime()) ?
                    ' ui-datepicker-dayRange' :
                    '';
                // it is in or out date?
                cfg[1] += range['in'] && range['in'].getTime() == date.getTime() ? ' ui-datepicker-dayRange-in' : '';
                cfg[1] += range['out'] && range['out'].getTime() == date.getTime() ? ' ui-datepicker-dayRange-out' : '';
            }

            return cfg;
        }

        /**
         * On mouse hover calendar cell
         * @param e event
         * @param i datepicker instance
         */
        function dateMouseEnter(e, i) {

            var $hover = $(this),
                hoverDate = new Date($hover.data('year') + '-' + ($hover.data('month') + 1) + '-' + $hover.data('day') + ' 00:00:00');
            $hover.addClass('ui-datepicker-dayRange-hover--' + (config.relationSuperior ? 'in' : 'out'));

            // highlight range on hover
            $('[data-handler=selectDay]', i.dpDiv).each(function () {
                var $cell = $(this),
                    cellDate = new Date($cell.data('year') + '-' + ($cell.data('month') + 1) + '-' + $cell.data('day') + ' 00:00:00');
                if (config.relationSuperior ?
                    range['out'] && cellDate.getTime() >= hoverDate.getTime() && cellDate.getTime() <= range['out'].getTime() :
                    range['in'] && cellDate.getTime() <= hoverDate.getTime() && cellDate.getTime() >= range['in'].getTime()) {
                    $cell.addClass('ui-datepicker-dayRange-hover');
                }
            });
        }

        /**
         * On mouse over from calendar cell
         * @param e event
         * @param i datepicker instance
         */
        function dateMouseLeave(e, i) {
            // remove all hover classes
            $('[data-handler=selectDay]', i.dpDiv).each(function () {
                $(this).removeClass('ui-datepicker-dayRange-hover');
                $(this).removeClass('ui-datepicker-dayRange-hover--in');
                $(this).removeClass('ui-datepicker-dayRange-hover--out');
            });
        }

        function getParams() {
            var r = {};
            if ($i.datepicker('option', 'disabled')) {
                return r;
            }
            var date = getDate();
            if (date) {
                r[config.name] = $.datepicker.formatDate(config.format, date);
            }

            return r;
        }

        function dateToString(date) {
            var str;
            var tM = (date.getUTCMonth()+1)
            var tD = date.getUTCDate();
            tM<10&&(tM="0"+tM);
            tD<10&&(tD="0"+tD);
            str = date.getUTCFullYear()+"-"+tM+"-"+tD;
            return str;
        }

        // todo something wrong here
        function updateRange() {
            var rel = controls[config.relationCalendar];
            if (rel) {
                range['in'] = getDate();
                range['out'] = rel.getDate();
                if (!config.relationSuperior) {
                    var tmp = range['in'];
                    range['in'] = range['out'];
                    range['out'] = tmp;
                }
            }
        }

        function selectMonth(date, f) {
            $c = hlf.getContainer(f, 'calendar', config.relationCalendar);
            $i = hlf.getEl($c, 'input');
            $($i).datepicker( "setDate", date );
        }

        /**
         * Draw
         *
         * @param name
         * @returns {*[]}
         */
        return function (name, $f, c, ti, $pl) {

            controls = c || {};
            config.tabIndex = ti || 0;
            $c = hlf.getContainer($f, 'calendar', name);
            $c.html(config.tplInput(config));

            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $h = hlf.getEl($c, 'hint');
            config.className&&$iw.addClass(config.className);
            $pl = hlf.getEl($c, 'placeholder');
            if ( config.mobileMode === true && $i[0]) {
                // initialization native date input
                $i[0].type = 'date';
                $iw.addClass('html5date');

                var today=new Date,mindate=new Date;mindate.setDate(today.getDate()+config.min);
                $i[0].min =  dateToString(mindate);

            } else {
                // draw ui control
                $i.datepicker({
                    minDate: config.min,
                    numberOfMonths: config.months,
                    onSelect: function (date, e) {
                        relationAdjust();
                        relationAutoSet();
                        relationAutoShow( $.datepicker.formatDate(config.format, getDate()));
                        config.onSelect(date, $.datepicker.formatDate(config.format, getDate()), e);
                        hlf.goal(config.goalSelectDate);
                        $iw.removeClass('hlf-state--error');
                    },
                    beforeShowDay: function (date) {
                        return getDayCfg(date);
                    },
                    beforeShow: function (e, i) {
                        i.dpDiv.attr('__cheat', uid);
                        updateRange();
                    },
                    afterShow: function (i) {
                        if (config.head) {
                            i.dpDiv.prepend(config.tplHead({
                                head: config.head
                            }));
                        }
                        if (_.isArray(details.points) && details.points.length) {
                            $(i.dpDiv).append(
                                config.tplLegend({
                                    'legend': config.legend,
                                    'points': _.map(details.points, details.formatter)
                                })
                            );
                        }
                        if (controls[config.relationCalendar]) {
                            $('[data-handler=selectDay]', i.dpDiv)
                                .on('mouseenter', _.partialRight(dateMouseEnter, i))
                                .on('mouseleave', _.partialRight(dateMouseLeave, i));
                        }
                    },
                    onClose: function (date, i) {
                        $('[data-handler=selectDay]', i.dpDiv).off('mouseenter mouseleave');
                        isAutoShown = false;
                    }
                });
            }
            // maybe set a default value?
            if (_.isDate(config.value)) {
                // correct date by timezone offset
                config.value.setTime(config.value.getTime() + config.value.getTimezoneOffset() * 60 * 1000);
                $i.datepicker('setDate', config.value);
            }

            // customize datepicker with locale, unfortunately only this method works well
            if (config.locale) {
                $i.datepicker('option', $.datepicker.regional[config.locale]);
            }

            $i.on('focus', function () {
                $c.addClass('hlf-state--focus');
                $iw.addClass('hlf-state--focus');
                $iw.removeClass('hlf-state--error');
                $pl.addClass('hidden');
            });

            $i.on('blur', function () {
                $c.removeClass('hlf-state--focus');
                $iw.removeClass('hlf-state--focus');

                if (config.mobileMode === true) {
                    relationAdjust();   //check the correct date in inputs
                    relationAutoSet();
                }

            });

            $h.on('click', function () {
                $iw.removeClass('hlf-state--error');
            });

            return {
                config: config,
                disable: disable,
                enable: enable,
                refresh: refresh,
                show: show,
                hide: hide,
                getStamp: getStamp,
                getDate: getDate,
                setAnotherDate: setAnotherDate,
                getParams: getParams,
                setDetails: setDetails,
                getDetails: getDetails,
                resetDetails: resetDetails,
                specifyDetails: specifyDetails,
                validate: validate
            };

        };

    };

    /**
     * Extension for jQuery.ui.datepicker
     */
    $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function (inst) {
        $.datepicker._updateDatepicker_original(inst);

        // add data-day attr to day cell
        if (typeof inst.settings.beforeShowDay == 'function') {
            // wrap beforeShowDay function and...
            inst.settings.beforeShowDay = _.wrap(inst.settings.beforeShowDay, function (func, date) {
                var dayConfig = func(date); // call user function
                dayConfig[1] += "' data-day='" + date.getDate(); // use quote cheat :)
                return dayConfig;
            });
        }

        // after show extension
        // todo fix it: works bad, calls too often
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow) {
            afterShow.apply(null, [inst]);
        }

    };

    $.datepicker.regional['ru-RU'] = {clearText: 'Удалить', clearStatus: '',
        closeText: 'Закрыть', closeStatus: 'Закрыть без изменений',
        prevText: '< Предыдущие', prevStatus: 'Посмотреть предыдущие месяцы',
        nextText: 'Следующие >', nextStatus: 'Посмотреть следующие месяцы',
        currentText: 'Текущий', currentStatus: 'Посмотреть текущий месяц',
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        monthNamesShort: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
        monthStatus: 'Посмотреть другой месяц', yearStatus: 'Посмотреть другой год',
        weekHeader: 'Sm', weekStatus: '',
        dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        dayStatus: 'Использовать DD как первый день недели', dateStatus: 'Выбрать DD, MM d',
        dateFormat: 'D, d M', firstDay: 1,
        initStatus: 'Выбрать дату', isRTL: false
    };
    $.datepicker.regional['en-US'] = {
        closeText: 'Done',
        prevText: 'Prev',
        nextText: 'Next',
        currentText: 'Today',
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        weekHeader: 'Wk',
        dateFormat: 'D, MM d', firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['en-GB'] = $.extend({}, $.datepicker.regional['en-US']);
    $.datepicker.regional['en-CA'] = $.extend({}, $.datepicker.regional['en-US']);
    $.datepicker.regional['en-IE'] = $.extend({}, $.datepicker.regional['en-US']);
    $.datepicker.regional['en-AU'] = $.extend({}, $.datepicker.regional['en-US']);
    $.datepicker.regional['fr-FR'] = {
        closeText: 'Fermer',
        prevText: 'Précédent',
        nextText: 'Suivant',
        currentText: 'Aujourd\'hlf',
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        monthNamesShort: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
        dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        weekHeader: 'Sem.',
        dateFormat: 'd M', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['es-ES'] = {
        closeText: 'Cerrar',
        prevText: '&#x3C;Ant',
        nextText: 'Sig&#x3E;',
        currentText: 'Hoy',
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Juv', 'Vie', 'Sáb'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
        weekHeader: 'Sm',
        dateFormat: 'd MM', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['de-DE'] = {
        closeText: 'Schließen',
        prevText: '&#x3C;Zurück',
        nextText: 'Vor&#x3E;',
        currentText: 'Heute',
        monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
            'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        weekHeader: 'KW',
        dateFormat: 'd MM', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['th-TH'] = {
        closeText: 'ปิด',
        prevText: '&#xAB;&#xA0;ย้อน',
        nextText: 'ถัดไป&#xA0;&#xBB;',
        currentText: 'วันนี้',
        monthNames: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
        monthNamesShort: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
        dayNames: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
        dayNamesShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
        dayNamesMin: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
        weekHeader: 'Wk',
        dateFormat: 'd MM', firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['it-IT'] = {
        closeText: 'Chiudi',
        prevText: '&#x3C;Prec',
        nextText: 'Succ&#x3E;',
        currentText: 'Oggi',
        monthNames: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
            'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
        monthNamesShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
            'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
        dayNames: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
        weekHeader: 'Sm',
        dateFormat: 'd MM', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['pl-PL'] = {
        closeText: 'Zamknij',
        prevText: '&#x3C;Poprzedni',
        nextText: 'Następny&#x3E;',
        currentText: 'Dziś',
        monthNames: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
        monthNamesShort: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
            'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
        dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
        dayNamesShort: ['Nie', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'So'],
        dayNamesMin: ['N', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
        weekHeader: 'Tydz',
        dateFormat: 'd M', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['id-ID'] = {
        closeText: 'Tutup',
        prevText: '&#x3C;mundur',
        nextText: 'maju&#x3E;',
        currentText: 'hari ini',
        monthNames: ['Januari','Februari','Maret','April','Mei','Juni',
            'Juli','Agustus','September','Oktober','Nopember','Desember'],
        monthNamesShort: ['Jan','Feb','Mar','Apr','Mei','Jun',
            'Jul','Agus','Sep','Okt','Nop','Des'],
        dayNames: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'],
        dayNamesShort: ['Min','Sen','Sel','Rab','kam','Jum','Sab'],
        dayNamesMin: ['Mg','Sn','Sl','Rb','Km','jm','Sb'],
        weekHeader: 'Mg',
        dateFormat: 'dd/mm',
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };

    $.datepicker.setDefaults($.datepicker.regional['en-US']);

})(jQuery, _, hlf);
;(function ($, _, hlf) {
    'use strict';
    hlf.noDates = function (config) {

        var $c = null,
            $chw = null,
            $ch = null,

            controls = {};

        config = _.defaults(config || {}, {
            name: 'unknownDates', // getParams() param name
            text: 'Checkbox',
            goalChange: {},
            onChange: function() {}, // fires on state change
            onOn: function() {}, // fires when checkbox set on
            onOff: function() {}, // fires when checkbox set off
            calendars: [], // calendar control names list
            tplInput: hlf.getTpl('noDates.input')
        });

        /**
         * Returns (if possible) this control value as string to use in URL
         * @returns {object}
         */
        function getParams() {
            var r = {};
            if($ch.is(':checked')) {
                r[config.name] = 1;
            }
            return r;
        }

        /**
         * Draws control in DOM
         * @param name string [hlf-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         */
        return function (name, $f, c, ti) {

            controls = c || {};
            config.tabIndex = ti || 0;

            $c = hlf.getContainer($f, 'noDates', name);
            $c.html(config.tplInput(config));

            $chw = hlf.getEl($c, 'noDates-input-wrap');
            $ch = hlf.getEl($c, 'noDates-input');

            $ch.on('change', function(e) {
                _.each(config.calendars, function(name) {
                    e.target.checked ? controls[name].disable() : controls[name].enable();
                });
                config.onChange(e);
                hlf.goal(config.goalChange, { // reach change goal
                    checked: e.target.checked
                });
                e.target.checked ? config.onOn(e) : config.onOff(e);
            });

            $ch.on('focus', function() {
                $chw.addClass('hlf-state--focus');
            });

            $ch.on('blur', function() {
                $chw.removeClass('hlf-state--focus');
            });

            return {
                config: config,
                getParams: getParams
            };

        };

    };
})(jQuery, _, hlf);
;(function ($, _, hlf) {
    'use strict';
    hlf.guests = function (config) {

        var $c = null, // container
            $doc = null, // document
            $g = null, // guests container
            $s = null, // summary
            $cc = null, // controls container
            $av = null, // adults value
            $ai = null, // adults increment control
            $ad = null, // adults decrement control
            $cv = null, // children value
            $ci = null, // children increment control
            $cd = null, // children decrement control
            $cl = null, // children list
            $clt = '', // children list title
            $chc = [], // child containers
            $chi = [], // child age increment control
            $chd = [], // child age decrement control
            $cha = [], // child age value

            controls = {};

        config = _.defaults(config || {}, {

            adults: 2, // adults default value
            adultsMax: 4,
            adultsMin: 1,
            children: [], // children age
            childrenMax: 3,
            childMaxAge: 17,
            childDefaultAge: 7,
            summary: function(adults, children) {
                return (adults + children.length);
            },

            adultsTitle: 'Adults',
            childrenTitle: 'Children',
            childAge: 'Age',
            childHint: 'Check da age!',
            childrenListTitle: 'It is children list',
            childValSep: false,

            titlesPosInside: false, // are titles inside 'val' container or not
            decControlContent: '&minus;',
            incControlContent: '&plus;',
            decControlContentChld: '&minus;',
            incControlContentChld: '&plus;',

            goalOpen: {},

            tplContainer: hlf.getTpl('guests.container'),
            tplChild: hlf.getTpl('guests.child')

        });

        /**
         * Returns (if possible) this control value as string to use in URL
         * @returns {object}
         */
        function getParams() {
            var r = {
                'adults': config.adults
            };
            if(config.children.length) {
                r['children'] = config.children.join(',');
            }
            return r;
        }


        function summaryClick() {
            $g.hasClass('hlf-state--closed') ? guestsOpen() : guestsClose();
            return false;
        }

        function guestsClose() {
            $g.addClass('hlf-state--closed');
            $g.removeClass('hlf-state--focus');
            $c.removeClass('hlf-state--focus');
        }

        function guestsOpen() {
            hlf.goal(config.goalOpen);
            $g.removeClass('hlf-state--closed');
            $g.addClass('hlf-state--focus');
            $c.addClass('hlf-state--focus');
        }

        function drawChild(key) {
            if (config.children[key]===null) {
                config.children[key] = config.childDefaultAge;
            }
            $cl.append(config.tplChild({
                key: key,
                age: config.children[key],
                title: config.childAge,
                hint: config.childHint,
                childValSep: config.childValSep,
                decControlContent: config.decControlContent,
                incControlContent: config.incControlContent,
                decControlContentChld: config.decControlContentChld,
                incControlContentChld: config.incControlContentChld

            }));

            $chc[key] = hlf.getEl($cl, 'child-container', key);
            $chi[key] = hlf.getEl($chc[key], 'child-age-increment');
            $cha[key] = hlf.getEl($chc[key], 'child-age');
            $chd[key] = hlf.getEl($chc[key], 'child-age-decrement');

            $chi[key].on('click', {operation: 1}, newAge);
            $chd[key].on('click', {operation: -1}, newAge);

            function newAge(e){
                var newValue;
                newValue = config.children[key] + e.data.operation;
                if ( newValue>config.childMaxAge || newValue<0){
                    return false
                }
                config.children[key] = newValue;
                $cha[key][0].textContent = newValue;
                return false;
            }
        }

        function update() {
            $s.html(config.summary(config.adults, config.children));
            $av.html(config.adults);
            $cv.html(config.children.length);

            if (config.children.length){
                $cl.removeClass('hlf-state--empty')
                $clt.removeClass('hlf-state--disabled');
            } else {
                $cl.addClass('hlf-state--empty');
                $clt.addClass('hlf-state--disabled');
            }

            config.children.length == config.childrenMax
                ? $ci.addClass('hlf-state--disabled')
                : $ci.removeClass('hlf-state--disabled');

            !config.children.length
                ? $cd.addClass('hlf-state--disabled')
                : $cd.removeClass('hlf-state--disabled');

            config.adults == config.adultsMax
                ? $ai.addClass('hlf-state--disabled')
                : $ai.removeClass('hlf-state--disabled');

            config.adults == config.adultsMin
                ? $ad.addClass('hlf-state--disabled')
                : $ad.removeClass('hlf-state--disabled');

        }

        /**
         * Draw in DOM
         * @param name string [hlf-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         * @param ti tabIndex value
         */
        return function (name, $f, c, ti) {

            controls = c || {};
            config.tabIndex = ti || 0;

            $doc = $(document);
            $c = hlf.getContainer($f, 'guests', name);
            $c.html(config.tplContainer(config));
            $g = hlf.getEl($c, 'guests');
            $s = hlf.getEl($c, 'summary');
            $cc = hlf.getEl($c, 'controls');
            $av = hlf.getEl($c, 'adults-val');
            $ad = hlf.getEl($c, 'adults-decrement');
            $ai = hlf.getEl($c, 'adults-increment');
            $cv = hlf.getEl($c, 'children-val');
            $cd = hlf.getEl($c, 'children-decrement');
            $ci = hlf.getEl($c, 'children-increment');
            $cl = hlf.getEl($c, 'children-list');
            $clt = hlf.getEl($c, 'children-list-title');
            config.className&&$g.addClass(config.className);
            _.each(config.children, function(v, key) {
                drawChild(key);
            });
            update();

            $doc.on('click', function(ev) { // todo check if this own block (multi controls problem)
                if(!$(ev.target).closest('[hlf-role=guests]').length) {
                    guestsClose();
                }
                ev.stopPropagation();
            });

            $s.on('click', summaryClick);

            $s.on('keydown', function(e) {
                switch(e.keyCode) {
                    case 38:
                        guestsClose();
                        break;
                    case 40:
                        guestsOpen();
                        break;
                    default: break;
                }
            });

            $s.on('focus', function() {
                $s.addClass('hlf-state--focus');
                $c.addClass('hlf-state--focus');
            });

            $s.on('blur', function() {
                $s.removeClass('hlf-state--focus');
                $c.removeClass('hlf-state--focus');
            });

            $ai.on('click', function() {
                if(config.adults == config.adultsMax) {
                    return false;
                }
                config.adults++;
                update();
                return false;
            });

            $ad.on('click', function() {
                if(config.adults == config.adultsMin) {
                    return false;
                }
                config.adults--;
                update();
                return false;
            });

            $ci.on('click', function() {
                if(config.children.length == config.childrenMax) {
                    return false;
                }
                config.children.push(null);
                drawChild(config.children.length - 1);
                update();
                return false;
            });

            $cd.on('click', function() {
                if(config.children.length == 0) {
                    return false;
                }
                $chc[config.children.length - 1].remove();
                config.children.pop();
                $chc.pop();
                $chi.pop();
                update();
                return false;
            });

            return {
                config: config,
                getParams: getParams,
            };

        };

    };
})(jQuery, _, hlf);
;(function ($, _, hlf) {
    'use strict';

    hlf.submit = function (config) {

        var $c = null, // container
            $b = null, // button

            controls = {};

        config = _.defaults(config || {}, {

            text: 'Submit',

            goalClick: {}, // same as everywhere

            tplButton: hlf.getTpl('submit.button')

        });

        return function (name, $f, c, ti) {

            controls = c || {};
            config.tabIndex = ti || 0;

            $c = hlf.getContainer($f, 'submit', name);
            $c.html(config.tplButton(config));

            $b = hlf.getEl($c, 'button');
            config.className&&$b.addClass(config.className);
            $b.on('click', function() {
                hlf.goal(config.goalClick);
            });

            return {
                config: config
            };

        };

    };

})(jQuery, _, hlf);