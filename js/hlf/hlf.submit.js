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

        function draw(name, $f, c, ti) {

            controls = c || {};
            config.tabIndex = ti || 0;

            $c = hlf.getContainer($f, 'submit', name);
            $c.html(config.tplButton(config));
            $b = hlf.getEl($c, 'button');

            $b.on('click', function() {
                hlf.goal(config.goalClick);
            });

            return {
                getConfig: getConfig
            };

        }

        function getConfig() {
            return config;
        }

        return draw;

    };

})(jQuery, _, hlf);