;(function ($, _, context) {
    'use strict';

    var hlf = function() {

        /**
         * Check google analytics (GA) exists on page
         * @returns {boolean|*}
         */
        function gaExists() {
            return typeof ga !== 'undefined' && _.isFunction(ga);
        }

        /**
         * Send event to GA
         * @param ev ['category', 'name']
         * @returns {boolean}
         */
        function gaEvent(ev) {
            if(gaExists() && typeof ev !== 'undefined' && _.isArray(ev) && ev.length) {
                ga('send', 'event', ev[0], ev[1]);
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
            if(!yam) {
                _.each(Ya._metrika.counters, function(v){
                    yam = v;
                    return;
                });
            }
            return !!yam;
        }

        /**
         * Send event to yam
         * @param ev 'event-name'
         * @returns {boolean}
         */
        function yamEvent(ev) {
            if(yamExists() && _.isString(ev)) {
                yam.reachGoal(ev);
                return true;
            }
            return false;
        }

        return {
            ga: {
                event: gaEvent,
                getLinkerParam: gaGetLinkerParam
            },
            yam: {
                event: yamEvent
            },
            // js templates
            jst: {}
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