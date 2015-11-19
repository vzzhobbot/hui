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
         * Its yandex metrika counters list
         * @type {object}
         */
        var yams = null;

        /**
         * Check yandex metrika exists on page
         * @returns {boolean}
         */
        function yamExists() {
            if(!yams && typeof Ya !== 'undefined') {
                yams = Ya._metrika.counters;
            }
            return !!Object.keys(yams || {}).length;
        }

        /**
         * Send goal to yam
         * @param goal 'goal-name'
         * @returns {boolean}
         */
        function yamGoal(goal) {
            if(yamExists() && _.isString(goal) && goal.length) {
                for (var k in yams) {
                    if (yams.hasOwnProperty(k)) {
                        yams[k].reachGoal(goal);
                    }
                }
                return true;
            }
            return false;
        }

        /**
         * Send goal to aviasales
         * @param goal 'goal-name'
         * @param d any json
         * @param sync {boolean} sync || async event
         * @returns {boolean}
         */
        function asGoal(goal, d, sync) {
            if(_.isString(goal) && goal.length) {
                $.ajax({
                    url: config.asGoalUrl,
                    type: 'get',
                    dataType: 'jsonp',
                    async: !sync,
                    data: {
                        goal: goal,
                        data: JSON.stringify(d)
                    }
                });
                return true;
            }
            return false;
        }

        function goal(goals, data, sync) {
            yamGoal(goals.yam || null);
            gaGoal(goals.ga ? goals.ga.split('.') : null);
            asGoal(goals.as || null, data, sync);
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