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

        function draw(name, $f, c) {
            controls = c || {};
            $c = hlf.getContainer($f, 'submit', name);
            $c.html(config.tplButton(config));
            $b = hlf.getEl($c, 'button');

            $b.on('click', function() {
                hlf.goal(config.goalClick);
            });

        }

        function getConfig() {
            return config;
        }

        return {
            draw: draw,
            getConfig: getConfig
        };

    };

})(jQuery, _, hlf);