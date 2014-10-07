;(function ($, _, hui) {
    'use strict';
    hui.checkbox = function (config) {

        var $c = null,
            $chw = null,
            $ch = null,
            controls = {};

        config = _.defaults(config || {}, {
            name: 'checkbox',
            text: 'Checkbox',
            onChange: function() {}, // fires on state change
            onOn: function() {}, // fires when checkbox set on
            onOff: function() {}, // fires when checkbox set off
            tplInput: hui.getTpl('hui-checkbox')
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
            $c.html(config.tplInput(config));
            $chw = hui.getEl($c, 'checkbox-input-wrap');
            $ch = hui.getEl($c, 'checkbox-input');

            $ch.on('change', function(e) {
                config.onChange(e);
                e.target.checked ? config.onOn(e) : config.onOff(e);
            });

            $ch.on('focus', function() {
                $chw.addClass('hui-state--focus');
            });

            $ch.on('blur', function() {
                $chw.removeClass('hui-state--focus');
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