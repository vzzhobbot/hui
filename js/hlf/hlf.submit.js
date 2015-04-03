;(function ($, _, hlf) {
    'use strict';

    hlf.submit = function (config) {

        var $c = null, // container
            $b = null, // button

            controls = {};

        config = _.defaults(config || {}, {

            text: 'Submit',

            goalClick: {}, // same as everywhere

            tplButton: hlf.getTpl('submit.button')

        });

        return function (name, $f, c, ti) {

            controls = c || {};
            config.tabIndex = ti || 0;

            $c = hlf.getContainer($f, 'submit', name);
            $c.html(config.tplButton(config));

            $b = hlf.getEl($c, 'button');
            config.className&&$b.addClass(config.className);
            $b.on('click', function() {
                hlf.goal(config.goalClick);
            });

            return {
                config: config
            };

        };

    };

})(jQuery, _, hlf);