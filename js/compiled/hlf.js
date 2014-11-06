;(function ($, _, context) {
    'use strict';

    var hlf = function() {

        var config = {
            asGoalUrl: (location.protocol == 'file:' ? 'http:' : '') + '//metrics.aviasales.ru'
        };

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
         * @returns string
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

    context.hlf = hlf;

})(jQuery, _, this);
this["hlf"] = this["hlf"] || {};
this["hlf"]["jst"] = this["hlf"]["jst"] || {};
this["hlf"]["jst"]["ac.input.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"hlf-input hlf-input--ac\" hlf-role=\"input-wrap\">\n    <input type=\"text\"\n           placeholder=\"<%= placeholder %>\"\n           value=\"<%= text %>\"\n           tabindex=\"<%= tabIndex %>\"\n           hlf-role=\"input\"/>\n    <div class=\"loader\" hlf-role=\"loader\"></div>\n    <div class=\"hint\" hlf-role=\"hint\"><%= hint %></div>\n</div>";
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
  return "<div class=\"hlf-input hlf-input--calendar\" hlf-role=\"input-wrap\">\n    <input type=\"text\" placeholder=\"<%= placeholder %>\" tabindex=\"<%= tabIndex %>\" hlf-role=\"input\"/>\n    <div class=\"hint\" hlf-role=\"hint\"></div>\n</div>";
  },"useData":true};

this["hlf"]["jst"]["calendar.legend.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"ui-datepicker-legend\">\n    <div class=\"ui-datepicker-legend-head\"><%= legend %></div>\n    <div class=\"ui-datepicker-legend-points\">\n        <div class=\"ui-datepicker-legend-points-line\"></div>\n        <ul class=\"ui-datepicker-legend-points-list\">\n            <% _.each(points, function(point, i) { %>\n            <li class=\"ui-datepicker-legend-points-item ui-datepicker-legend-points-item--<%= i %>\"><%= point %></li>\n            <% }); %>\n        </ul>\n    </div>\n</div>";
  },"useData":true};

this["hlf"]["jst"]["guests.child.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<li class=\"hlf-guests-children-item\" hlf-role=\"child-container\" hlf-name=\"<%= key %>\">\n    <div class=\"hlf-input\" hlf-role=\"input-wrap\">\n        <input type=\"text\" hlf-role=\"input\" value=\"<%= age %>\"/>\n        <div class=\"hint\" hlf-role=\"hint\"><%= hint %></div>\n    </div>\n</li>";
  },"useData":true};

this["hlf"]["jst"]["guests.container.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"hlf-guests hlf-state--closed\" hlf-role=\"guests\">\n    <a href=\"#\" class=\"hlf-guests-i\" tabindex=\"<%= tabIndex %>\" hlf-role=\"summary\"></a>\n    <div class=\"hlf-guests-dd\" hlf-role=\"controls\">\n        <div class=\"hlf-guests-adults\">\n            <div class=\"hlf-guests-adults-title\"><%= adultsTitle %></div>\n            <div class=\"hlf-guests-adults-controls\">\n                <a href=\"#\" hlf-role=\"adults-decrement\">-</a>\n                <div class=\"hlf-guests-adults-val\" hlf-role=\"adults-val\"></div>\n                <a href=\"#\" hlf-role=\"adults-increment\">+</a>\n            </div>\n        </div>\n        <div class=\"hlf-guests-children\">\n            <div class=\"hlf-guests-children-title\"><%= childrenTitle %></div>\n            <div class=\"hlf-guests-children-controls\">\n                <a href=\"#\" hlf-role=\"children-decrement\">-</a>\n                <div class=\"hlf-guests-children-val\" hlf-role=\"children-val\"></div>\n                <a href=\"#\" hlf-role=\"children-increment\">+</a>\n            </div>\n            <ul class=\"hlf-guests-children-list\" hlf-role=\"children-list\"></ul>\n        </div>\n    </div>\n</div>";
  },"useData":true};

this["hlf"]["jst"]["noDates.input.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<label hlf-role=\"noDates-input-wrap\">\n    <input type=\"checkbox\" tabindex=\"<%= tabIndex %>\" hlf-role=\"noDates-input\"><%= text %>\n</label>";
  },"useData":true};

this["hlf"]["jst"]["submit.button.jst"] = {"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<button tabindex=\"<%= tabIndex %>\" hlf-role=\"button\"><%= text %></button>";
  },"useData":true};
;(function ($, _, hlf) {
    'use strict';

    hlf.form = function (n, controls, params, goalSubmit) {

        /**
         * set/get for params
         *
         * @param name
         * @param value
         * @returns {*}
         */
        function param(name, value) {
            if(!value) {
                return params[name];
            }
            params[name] = value;
        }

        var $f = $('[hlf-form="' + n +'"]'),
            uid = _.uniqueId(),
            tabIndex = 1;

        _.each(controls, function(control, name) {
            var config = control.getConfig();
            _.each(config, function(value, key) {
                if(_.isFunction(value)) {
                    config[key] = _.partialRight(value, controls);
                }
            });
            config.tabIndex = (uid + '') + tabIndex++;
            control.draw(name, $f, controls);
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

                var p =
                    // collect controls data
                    _.map(controls, function(i) {
                        return _.isFunction(i.getParams) ? i.getParams() : null;
                    })
                    // additional params if needed
                    .concat(_.map(params || {}, function(v, k) {
                        return k + '=' + v;
                    }));
                // collect ga tracker param
                p.push(hlf.gaGetLinkerParam());
                // remove empty strings
                p = _.filter(p, function(i) {
                    return i;
                });
                hlf.goal(goalSubmit, {
                    params: p
                });
                window.location = $f.attr('action') + '/?' + p.join('&');
                return false;
            }
            return result;
        });

        return {
            controls: controls,
            param: param
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
            controls = {},
            goalUseInputSent = false; // flag event 'use' sent

        config = _.defaults(config || {}, {
            url: (location.protocol == 'file:' ? 'http:' : '') + '//yasen.hotellook.com/autocomplete',
            name: 'destination', // getParams() param name in case
                                 // you select nothing in autocomplete
            text: '', // default input value
            type: '', // default type
            id: 0, // default id
            limit: 5,
            locale: 'en-US',
            // events
            goalUseInput: {}, // {ga: 'la-la-la.bla-bla', yam: 'sdasds', as: 'something'}
            goalAcSelect: {},
            goalUseSamples: {},
            placeholder: 'Type something....',
            autoFocus: false, // auto focus if field is empty
            hint: 'panic!', // this control always required, its hint text
            onSelect: function() {},
            onSelectShowCalendar: null,
            onReset: function() {},
            avgPricesUrl: (location.protocol == 'file:' ? 'http:' : '') + '//search.hotellook.com/ajax/location-avg-prices.json?locationId={id}',
            avgPricesCalendars: [], // names if controls
            avgPricesFormatter: function(v) {
                return '' + Math.round(v);
            },
            categoryTranslate: function(t) {
                return t;
            },
            hotelsCountTranslate: function(n) {
                return n + ' hotels';
            },
            samplesText: 'For example: {list}',
            samplesList: [], // [{id: 15542, type: 'location', text: 'Paris, France', sample: 'Paris'}]
            tplInput: hlf.getTpl('ac.input'),
            tplSamples: hlf.getTpl('ac.samples'),
            tplSamplesLink: hlf.getTpl('ac.samplesLink')
        });

        function avgPricesRequest (id) {
            if(config.avgPricesCalendars.length) {
                $.ajax({
                    dataType: 'jsonp',
                    type: 'get',
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
                        controls[name].specify(data, config.avgPricesFormatter);
                        controls[name].refresh();
                        first = controls[name];
                    } else {
                        controls[name].setDetails(first.getDetails());
                        controls[name].refresh();
                    }
                });
            }
        }

        /**
         * Get params string
         * @returns {string | null}
         */
        function getParams() {
            if(!!config.id && config.type) {
                return config.type + 'Id=' + config.id;
            }
            if(config.text) {
                return config.name + '=' + config.text;
            }
            return null;
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
                            category: config.categoryTranslate('Locations'),
                            type: 'location',
                            value: item.fullname,
                            text: item.city,
                            clar: (item.state ? item.state + ', ' : '') + item.country,
                            comment: config.hotelsCountTranslate(item.hotelsCount)
                        }
                    });
                    var hotels = _.map(data.hotels, function(item) {
                        return {
                            id: item.id,
                            category: config.categoryTranslate('Hotels'),
                            type: 'hotel',
                            value: item.name + ', ' + item.city + ', ' + item.country,
                            text: item.name,
                            clar: item.city + ', ' + item.country
                        }
                    });
                    response(_.union(cities, hotels));
                    $iw.removeClass('hlf-state--loading');
                },
                error: function() {
                    $iw.removeClass('hlf-state--loading');
                }
            });
        }

        function onReset() {
            if(config.avgPricesUrl) {
                _.each(config.avgPricesCalendars, function(name) {
                    controls[name].resetDetails();
                });
            }
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
                if(!controls[config.onSelectShowCalendar].getStamp()) {
                    controls[config.onSelectShowCalendar].show();
                }
            }
        }

        function draw(name, $f, c) {

            if(config.id) {
                avgPricesRequest(config.id);
            }

            controls = c || {};
            $c = hlf.getContainer($f, 'ac', name);
            $c.html(config.tplInput(config));
            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $h = hlf.getEl($c, 'hint');
            $l = hlf.getEl($c, 'loader');

            $i.reachAutocomplete({
                source: source,
                select: function(ev, data) {
                    select(data.item.type, data.item.id);
                    hlf.goal(config.goalAcSelect, data.item);
                },
                minLength: 3
            });

            $i.on('keyup', function() {
                config.text = $i.val();
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
            });

            $i.on('focus', function() {
                $iw.addClass('hlf-state--focus');
                $iw.removeClass('hlf-state--error');
                goalUseInputSent = false;
            });

            $i.on('blur', function() {
                $iw.removeClass('hlf-state--focus');
            });

            $h.on('click', function() {
                $iw.removeClass('hlf-state--error');
            });

            if(config.autoFocus && !config.text.length) {
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
                    return false;
                });

            }

        }

        function getConfig() {
            return config;
        }

        function validate() {
            if(getParams()) {
                return true;
            }
            $i.focus();
            $iw.addClass('hlf-state--error');
            return false;
        }

        return {
            draw: draw,
            select: select,
            getParams: getParams,
            getConfig: getConfig,
            validate: validate
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
            var label = '<span class="ui-menu-item-text">' + item.text + '</span>';
            if (item.clar)
                label += '<span class="ui-menu-item-clar">, ' + item.clar + '</span>';
            if (item.comment)
                label += '<span class="ui-menu-item-comment">' + item.comment + '</span>';
            return $("<li>")
                .append($("<a>").html(label))
                .appendTo(ul);
        }
    });

})(jQuery, _, hlf);
;(function ($, _, hlf) {
    'use strict';

    hlf.calendar = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $h = null, // hint
            controls = {},
            uid = _.uniqueId('hlf.calendar'); /* Unique id for "refresh" cheating.
                                               * $i.datepicker('widget') returns any opened datepicker,
                                               * that means we need to mark this calendar with uid
                                               * to check uid in refresh function */
        var details = {},
            isAutoShown = false;

        config = _.defaults(config || {}, {
            goalSelectDate: {},
            required: false,
            placeholder: 'Choose date...',
            name: 'date', // getParams param name
            value: null, // Date()
            format: 'yy-mm-dd', // getParams() format
            min: 0, // min selectable date (in days from today)
            months: 2, // num of months visible in datepicker
            hintEmpty: 'empty-panica!', // hint text if required calendar field is empty
            hintPeriod: 'period-panica!', // todo hint text if relation calendar date >30 days
            head: null, // datepicker head text
            legend: 'Days colored by average price for the night',
            onSelect: function() {},
            locale: 'en-US',
            relationCalendar: null, // name of control
            relationSuperior: true, // 1 - superior, 0 - inferior
            relationAutoSet: false,
            relationAutoShow: false,
            tplInput: hlf.getTpl('calendar.input'),
            tplHead: hlf.getTpl('calendar.head'),
            tplLegend: hlf.getTpl('calendar.legend')
        });

        function getParams() {
            if($i.datepicker('option', 'disabled')) {
                return null;
            }
            var date = getDate();
            if(date) {
                return config.name + '=' + $.datepicker.formatDate(config.format, date);
            }
            return null;
        }

        function disable() {
            $i.datepicker('option', 'disabled', true);
            $iw.addClass('hlf-state--disabled');
            $iw.removeClass('hlf-state--error');
        }

        function enable() {
            $i.datepicker('option', 'disabled', false);
            $iw.removeClass('hlf-state--disabled');
        }

        function relationAdjust() {
            var relation = controls[config.relationCalendar];
            if(relation && relation.getStamp()) {
                if(config.relationSuperior) {
                    if(relation.getStamp() <= getStamp()) {
                        relation.setDate(getDate(), 1);
                    }
                } else {
                    if(relation.getStamp() >= getStamp()) {
                        relation.setDate(getDate(), -1);
                    }
                }
            }
        }

        function relationAutoSet() {
            var relation = controls[config.relationCalendar];
            if(relation && !relation.getStamp() && config.relationAutoSet) {
                if(config.relationSuperior) {
                    relation.setDate(getDate(), 1);
                } else {
                    relation.setDate(getDate(), -1);
                }
            }
        }

        function relationAutoShow() {
            var relation = controls[config.relationCalendar];
            if(relation && !isAutoShown) {
                if(config.relationAutoShow) {
                    relation.show(true);
                }
            }
        }

        function draw(name, $f, c) {
            controls = c || {};
            $c = hlf.getContainer($f, 'calendar', name);
            $c.html(config.tplInput(config));
            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $h = hlf.getEl($c, 'hint');

            $i.datepicker({
                minDate: config.min,
                numberOfMonths: config.months,
                //showOn: 'both', // todo
                //buttonText: '',
                onSelect: function(date, e) {
                    relationAdjust();
                    relationAutoSet();
                    relationAutoShow();
                    config.onSelect(date, $.datepicker.formatDate(config.format, getDate()), e);
                    hlf.goal(config.goalSelectDate);
                    $iw.removeClass('hlf-state--error');
                },
                beforeShowDay: function(date) {
                    return getDayCfg(date);
                },
                beforeShow: function(e, i) {
                    i.dpDiv.attr('__cheat', uid);
                },
                afterShow: function() {
                    if(config.head) {
                        $('#ui-datepicker-div').prepend(config.tplHead({
                            head: config.head
                        }));
                    }
                    if(_.isArray(details.points) && details.points.length) {
                        $('.ui-datepicker-row-break').html(
                            config.tplLegend({
                                'legend': config.legend,
                                'points': _.map(details.points, details.formatter)
                            })
                        );
                    }
                },
                onClose: function() {
                    isAutoShown = false;
                }
            });
            // maybe set a date?
            if(_.isDate(config.value)) {
                // correct date by timezone offset
                config.value.setTime(config.value.getTime() + config.value.getTimezoneOffset() * 60 * 1000);
                $i.datepicker('setDate', config.value);
            }
            // customize datepicker with locale
            if(config.locale) {
                $i.datepicker('option', $.datepicker.regional[config.locale]);
            }

            $i.on('focus', function() {
                $iw.addClass('hlf-state--focus');
                $iw.removeClass('hlf-state--error');
            });

            $i.on('blur', function() {
                $iw.removeClass('hlf-state--focus');
            });

            $h.on('click', function() {
                $iw.removeClass('hlf-state--error');
            });

        }

        function show(v) {
            isAutoShown = !!v;
            setTimeout(function(){ // jquery.ui.datepicker show cheat
                $i.datepicker('show');
            }, 16);
        }

        function hide() {
            $i.datepicker('hide');
        }

        function refresh() {
            var $widget = $i.datepicker('widget');
            if($widget.is(':visible') && $widget.attr('__cheat') == uid) {
                $i.datepicker('refresh');
            }
        }

        function dateModify (date, modify) {
            date.setDate(date.getDate() + modify);
            return date;
        }

        function getStamp () {
            var date = $i.datepicker('getDate');
            if(date) {
                return (new Date($i.datepicker('getDate'))).getTime();
            }
            return null;
        }

        function getDate () {
            var date = $i.datepicker('getDate');
            if(date) {
                return new Date(date);
            }
            return null;
        }

        function setDate (date, modify) {
            $i.datepicker('setDate', dateModify(date, modify));
            $iw.removeClass('hlf-state--error');
        }

        function getConfig() {
            return config;
        }

        function validate() {
            if(!config.required || $i.datepicker('option', 'disabled') || !!getParams()) {
                return true;
            }
            $iw.addClass('hlf-state--error');
            $h.html(config.hintEmpty);
            return false;
        }

        /**
         * Process each date average price & calculate day details
         * @param data
         * @param formatter function
         */
        function specify(data, formatter) { // todo strange logic
            if(!_.size(data))
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
                    if(percent > 60)
                        rate = 4;
                } else {
                    if (percent > 20)
                        rate = 1;
                    if(percent > 60)
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
                formatter: formatter || function(v) {return v}
            });
            return true;
        }

        function setDetails(d) {
            $iw.addClass('hlf-state--detailed');
            details = d;
        }

        function getDetails() {
            return _.clone(details, true);
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
            var month = (date.getMonth() + 1),
                day = date.getDate(),
                dateStr =
                    date.getFullYear() + '-' +
                        (month < 10 ? '0' + month : month) + '-' +
                        (day < 10 ? '0' + day : day),
                cfg = [true, '', ''];
            if(!_.isUndefined(details.dates) && details.dates[dateStr]) {
                cfg = [
                    true, // something :)
                    'ui-datepicker-dayType ui-datepicker-dayType--' + details.dates[dateStr].rate, // cell class
                    details.formatter(details.dates[dateStr].value)
                ];
            }
            return cfg;
        }

        return {
            disable: disable,
            enable: enable,
            draw: draw,
            refresh: refresh,
            show: show,
            hide: hide,
            getStamp: getStamp,
            getDate: getDate,
            setDate: setDate,
            getParams: getParams,
            getConfig: getConfig,
            setDetails: setDetails,
            getDetails: getDetails,
            resetDetails: resetDetails,
            specify: specify,
            validate: validate
        };

    };

    /**
     * Extension for jQuery.ui.datepicker
     */
    $(function () {
        $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
        $.datepicker._updateDatepicker = function (inst) {
            $.datepicker._updateDatepicker_original(inst);
            var afterShow = this._get(inst, 'afterShow');
            if (afterShow)
                afterShow.apply((inst.input ? inst.input[0] : null));
        }
    });

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
        dateFormat: 'D, d M yy', firstDay: 1,
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
        dateFormat: 'D, MM d, yy', firstDay: 0,
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
        monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin',
            'Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
        monthNamesShort: ['janvier','février','mars','avril','mai','juin',
            'juillet','août','septembre','octobre','novembre','décembre'],
        dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
        dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
        dayNamesMin: ['D','L','M','M','J','V','S'],
        weekHeader: 'Sem.',
        dateFormat: 'd M yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['es-ES'] = {
        closeText: 'Cerrar',
        prevText: '&#x3C;Ant',
        nextText: 'Sig&#x3E;',
        currentText: 'Hoy',
        monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
        monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun',
            'Jul','Ago','Sep','Oct','Nov','Dic'],
        dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
        dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
        dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
        weekHeader: 'Sm',
        dateFormat: 'd MM yy', firstDay: 1,
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
        dateFormat: 'd MM yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['th-TH'] = {
        closeText: 'ปิด',
        prevText: '&#xAB;&#xA0;ย้อน',
        nextText: 'ถัดไป&#xA0;&#xBB;',
        currentText: 'วันนี้',
        monthNames: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
            'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
        monthNamesShort: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
            'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
        dayNames: ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'],
        dayNamesShort: ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'],
        dayNamesMin: ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'],
        weekHeader: 'Wk',
        dateFormat: 'd MM yy', firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['it-IT'] = {
        closeText: 'Chiudi',
        prevText: '&#x3C;Prec',
        nextText: 'Succ&#x3E;',
        currentText: 'Oggi',
        monthNames: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
            'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
        monthNamesShort: ['Gen','Feb','Mar','Apr','Mag','Giu',
            'Lug','Ago','Set','Ott','Nov','Dic'],
        dayNames: ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
        dayNamesShort: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
        dayNamesMin: ['Do','Lu','Ma','Me','Gi','Ve','Sa'],
        weekHeader: 'Sm',
        dateFormat: 'd MM yy', firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.regional['pl-PL'] = {
        closeText: 'Zamknij',
        prevText: '&#x3C;Poprzedni',
        nextText: 'Następny&#x3E;',
        currentText: 'Dziś',
        monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
            'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
        monthNamesShort: ['stycznia','lutego','marca','kwietnia','maja','czerwca',
            'lipca','sierpnia','września','października','listopada','grudnia'],
        dayNames: ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
        dayNamesShort: ['Nie','Pn','Wt','Śr','Czw','Pt','So'],
        dayNamesMin: ['N','Pn','Wt','Śr','Cz','Pt','So'],
        weekHeader: 'Tydz',
        dateFormat: 'd M yy', firstDay: 1,
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
         * @returns {string|null}
         */
        function getParams() {
            if($ch.is(':checked')) {
                return config.name + '=1';
            }
            return null;
        }

        /**
         * Draws control in DOM
         * @param name string [hlf-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         */
        function draw(name, $f, c) {
            controls = c || {};
            $c = hlf.getContainer($f, 'noDates', name);
            $c.html(config.tplInput(config));
            $chw = hlf.getEl($c, 'noDates-input-wrap');
            $ch = hlf.getEl($c, 'noDates-input');

            $ch.on('change', function(e) {
                _.each(config.calendars, function(name) {
                    e.target.checked ? controls[name].disable() : controls[name].enable();
                });
                config.onChange(e);
                hlf.goal(config.goalChange, {
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

        }

        /**
         * Returns control config object
         * @returns {*}
         */
        function getConfig() {
            return config;
        }

        return {
            draw: draw,
            getParams: getParams,
            getConfig: getConfig
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
            $chc = [], // child containers
            $chiw = [], // child input wraps
            $chi = [], // child inputs
            $chh = [], // child hints
            controls = {};
        config = _.defaults(config || {}, {
            goalOpen: {},
            adultsMax: 4,
            adultsMin: 1,
            adults: 2, // adults value
            children: [], // children age
            childrenMax: 3,
            childMaxAge: 17,
            adultsTitle: 'Adults',
            childrenTitle: 'Children',
            childHint: 'Check da age!',
            summary: function(adults, children) {
                return (adults + children.length);
            },
            tplContainer: hlf.getTpl('guests.container'),
            tplChild: hlf.getTpl('guests.child')
        });

        /**
         * Returns (if possible) this control value as string to use in URL
         * @returns {string|null}
         */
        function getParams() {
            var str = 'adults=' + config.adults;
            if(config.children.length) {
                str += '&children=' + config.children.join(',');
            }
            return str;
        }

        function validate() {
            // validate each field
            var r = _.map(config.children, function(age, key) {
                var ok = !(age === null || parseInt(age) < 0 || parseInt(age) > config.childMaxAge);
                if(ok) {
                    $chiw[key].removeClass('hlf-state--error');
                }
                return ok;
            });
            // show hint of first error
            _.each(r, function(ok, key) {
                if(!ok) {
                    $chi[key].focus();
                    $chiw[key].addClass('hlf-state--error');
                    return false;
                }
            });
            // count error results
            return !_.filter(r, function(ok) {
                return !ok;
            }).length;
        }

        function summaryClick() {
            $g.hasClass('hlf-state--closed') ? guestsOpen() : guestsClose();
            return false;
        }

        function guestsClose() {
            $g.addClass('hlf-state--closed');
            $g.removeClass('hlf-state--focus');
        }

        function guestsOpen() {
            hlf.goal(config.goalOpen);
            $g.removeClass('hlf-state--closed');
            $g.addClass('hlf-state--focus');
        }

        /**
         * Draws control in DOM
         * @param name string [hlf-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         */
        function draw(name, $f, c) {
            controls = c || {};
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
            _.each(config.children, function(v, key) {
                drawChild(key);
            });
            update();

            $doc.on('click', function(ev) {
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
            });

            $s.on('blur', function() {
                $s.removeClass('hlf-state--focus');
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
                $chiw.pop();
                $chi.pop();
                $chh.pop();
                update();
                return false;
            });

        }

        function drawChild(key) {

            $cl.append(config.tplChild({
                key: key,
                age: config.children[key],
                hint: config.childHint
            }));

            $chc[key] = hlf.getEl($cl, 'child-container', key);
            $chiw[key] = hlf.getEl($chc[key], 'input-wrap');
            $chi[key] = hlf.getEl($chc[key], 'input');
            $chh[key] = hlf.getEl($chc[key], 'hint');

            $chi[key].on('focus', function() {
                $chiw[key].addClass('hlf-state--focus');
                $chiw[key].removeClass('hlf-state--error');
            });

            $chi[key].on('blur', function() {
                $chiw[key].removeClass('hlf-state--focus');
            });

            $chi[key].on('keyup', function() {
                var val = $chi[key].val().trim();
                if(!val.length || !_.isFinite(val)) {
                    config.children[key] = null;
                } else {
                    config.children[key] = parseInt(val);
                }
            });

            $chi[key].on('keydown', function(e) {
                $chiw[key].removeClass('hlf-state--error');
            });

            $chh[key].on('click', function() {
                $chiw[key].removeClass('hlf-state--error');
            });

            if(config.children[key] == null) {
                $chi[key].focus();
            }

        }

        function update() {
            $s.html(config.summary(config.adults, config.children));
            $av.html(config.adults);
            $cv.html(config.children.length);

            config.children.length
                ? $cl.removeClass('hlf-state--empty')
                : $cl.addClass('hlf-state--empty');

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
         * Returns control config object
         * @returns {*}
         */
        function getConfig() {
            return config;
        }

        return {
            draw: draw,
            getParams: getParams,
            getConfig: getConfig,
            validate: validate
        };

    };
})(jQuery, _, hlf);
;(function ($, _, hlf) {
    'use strict';

    hlf.submit = function (config) {

        var $c = null,
            $b = null,
            controls = {};

        config = _.defaults(config || {}, {
            goalClick: {},
            text: 'Submit',
            tplButton: hlf.getTpl('submit.button')
        });

        function draw(name, $f, c) {
            controls = c || {};
            $c = hlf.getContainer($f, 'submit', name);
            $c.html(config.tplButton(config));
            $b = hlf.getEl($c, 'button');

            $b.on('click', function() {
                hlf.goal(config.goalClick);
            });

        }

        function getConfig() {
            return config;
        }

        return {
            draw: draw,
            getConfig: getConfig
        };

    };

})(jQuery, _, hlf);