;(function ($, _, hui) {
    'use strict';
    hui.guests = function (config) {

        var ADULTS_MAX = 4,
            ADULTS_MIN = 1,
            CHILDREN_MAX = 3,
            CHILD_AGE_MAX = 17;

        var $c = null, // container
            $s = null, // summary
            $cc = null, // controls container
            $av = null, // adults value
            $ai = null, // adults increment control
            $ad = null, // adults decrement control
            $cv = null, // children value
            $ci = null, // children increment control
            $cd = null, // children decrement control
            controls = {};
        config = _.defaults(config || {}, {
            adults: 2,
            children: []
        });

        /**
         * Returns (if possible) this control value as string to use in URL
         * @returns {string|null}
         */
        function getParams() {
            if(config.children.length && !_.filter(config.children, function(a) {return a === null}).length) {
                return 'adults=' + config.adults + '&children=' + config.children.join(',');
            }
            return null;
        }

        /**
         * Draws control in DOM
         * @param name string [hui-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         */
        function draw(name, $f, c) {
            controls = c || {};
            $c = hui.getEl($f, 'guests', name);
            $c.html(hui.getTpl('hui-guests')(config));
            $s = hui.getEl($c, 'summary');
            $cc = hui.getEl($c, 'controls');
            $av = hui.getEl($c, 'adults-val');
            $ad = hui.getEl($c, 'adults-decrement');
            $ai = hui.getEl($c, 'adults-increment');
            $cv = hui.getEl($c, 'children-val');
            $cd = hui.getEl($c, 'children-decrement');
            $ci = hui.getEl($c, 'children-increment');
            update();

            $ai.on('click', function() {
                if(config.adults++ == ADULTS_MAX) {
                    config.adults = ADULTS_MAX;
                }
                update();
                return false;
            });

            $ad.on('click', function() {
                if(config.adults-- == ADULTS_MIN) {
                    config.adults = ADULTS_MIN;
                }
                update();
                return false;
            });

        }

        function update() {
            $s.html('Guests ' + (config.adults + config.children.length));
            $av.html(config.adults);
            $cv.html(config.children.length);

            $ai.removeClass('hui-state--disabled');
            if(config.adults == ADULTS_MAX) {
                $ai.addClass('hui-state--disabled');
            }

            $ad.removeClass('hui-state--disabled');
            if(config.adults == ADULTS_MIN) {
                $ad.addClass('hui-state--disabled');
            }
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
})(jQuery, _, hui);