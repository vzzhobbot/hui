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
            $chHints = [], // children hints
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
            var str = 'adults=' + config.adults;
            if(config.children.length) {
                str += '&children=' + config.children.join(',');
            }
            return str;
        }

        function validate() {
            var e = _.filter(config.children, function(age, k) {
                var r = (age === null || parseInt(age) < 0 || parseInt(age) > CHILD_AGE_MAX);
                if(!r) {
                    $chHints[k].show();
                } else {
                    $chHints[k].hide();
                }
                return r;
            });
            return !e.length;
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
                if(config.adults == ADULTS_MAX) {
                    return false;
                }
                config.adults++;
                update();
                return false;
            });

            $ad.on('click', function() {
                if(config.adults == ADULTS_MIN) {
                    return false;
                }
                config.adults--;
                update();
                return false;
            });

            $ci.on('click', function() {
                if(config.children.length == CHILDREN_MAX) {
                    return false;
                }
                config.children.push(null);
                update();
                return false;
            });

            $cd.on('click', function() {
                if(config.children.length == 0) {
                    return false;
                }
                config.children.pop();
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
            getConfig: getConfig,
            validate: validate
        };

    };
})(jQuery, _, hui);