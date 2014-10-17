;(function ($, _, hlf) {
    'use strict';

    hlf.submit = function (config) {

        var $c = null,
            $b = null,
            controls = {};

        config = _.defaults(config || {}, {
            gaEvent: [], // category & event to send to ga, ex: ['formTop'], ['submit']
            text: 'Submit',
            tplButton: _.template('<button hlf-role="button"><%= text %></button>')
        });

        function draw(name, $f, c) {
            controls = c || {};
            $c = hlf.getContainer($f, 'submit', name);
            $c.html(config.tplButton(config));
            $b = hlf.getEl($c, 'button');

            $b.on('click', function() {
                // send data to ga if needed
                if(config.gaEvent.length && typeof ga !== 'undefined' && _.isFunction(ga)) {
                    ga('send', 'event', config.gaEvent[0], config.gaEvent[1]);
                }
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