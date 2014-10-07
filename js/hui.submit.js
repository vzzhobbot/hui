;(function ($, _, hui) {
    'use strict';

    hui.submit = function (config) {

        var $c = null,
            $b = null,
            controls = {};

        config = _.defaults(config || {}, {
            text: 'Submit',
            tpls: {
                button: hui.getTpl('hui-submit')
            }
        });

        function draw(name, $f, c) {
            controls = c || {};
            $c = hui.getEl($f, 'submit', name);
            $c.html(config.tpls.button(config));
            $b = hui.getEl($f, 'button', name);
        }

        function getConfig() {
            return config;
        }

        return {
            draw: draw,
            getConfig: getConfig
        };

    };

})(jQuery, _, hui);