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