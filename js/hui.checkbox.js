;(function ($, _, hui) {
    'use strict';
    hui.checkbox = function (config) {

        var $c = null,
            $ch = null,
            controls = {};
        config = _.defaults(config || {}, {
            name: 'checkbox',
            text: 'Checkbox',
            onChange: function() {}, // fires on state change
            onOn: function() {}, // fires when checkbox set on
            onOff: function() {} // fires when checkbox set off
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
         * @param name string [hui-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         */
        function draw(name, $f, c) {
            controls = c || {};
            $c = hui.getEl($f, 'checkbox', name);
            $c.html(hui.getTpl('hui-checkbox')(config));
            $ch = hui.getEl($c, 'checkbox-input');

            $ch.on('change', function(e) {
                config.onChange(e);
                e.target.checked ? config.onOn(e) : config.onOff(e);
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
})(jQuery, _, hui);