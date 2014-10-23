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
            gaEvent: [], // category & event to send to ga, ex: ['formTop'], ['noFuckingDates']
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
                hlf.ga.event(config.gaEvent);
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