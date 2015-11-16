;(function ($, _, hlf) {
    'use strict';

    /**
     * Form constructor
     * @param config
     * @param noMarker bool dont try to find marker
     * @returns {{controls: {}, param: Function}}
     */
    hlf.form = function (config, noMarker) {

        config = _.defaults(config || {}, {
            id: null,
            controls: {},
            params: {},
            target: '_self',
            hash: null,
            goalSubmit: {},
            onSubmit: function() {}
        });

        var $f = $('[hlf-form="' + config.id +'"]'), // todo check availability
            uid = _.uniqueId(), // form uid
            tabIndex = 1, // controls tabIndex counter
            controls = {};

        // draw each control
        _.each(config.controls, function(c, n) {
            controls[n] = c(n, $f, controls, uid + (tabIndex++) + '');
        });

        // wrap config functions to use controls obj
        _.each(controls, function(control) {
            _.each(control.config, function(value, key) {
                if(_.isFunction(value)) {
                    control.config[key] = _.partialRight(value, controls);
                }
            });
        });

        $f.on('submit', function() {
            var result = true;
            _.each(controls, function(control) {
                if(control.validate && _.isFunction(control.validate)) {
                    result = control.validate();
                }
                return result;
            });
            if(result) {
                // collect controls data
                var p = _.reduce(_.map(controls, function(i) {
                    return _.isFunction(i.getParams) ? i.getParams() : {};
                }), function(result, d) {
                    return _.merge(result, d);
                });

                // additional params if needed
                if(_.isUndefined(config.params.marker) && !noMarker) { // try to find marker in GET, then in cookie
                    var marker = hlf.GET('marker') || hlf.readCookie('marker') || null;
                    if(marker) {
                        config.params.marker = marker;
                    }
                }

                // try to find hls in GET
                if(_.isUndefined(config.params.hls)) {
                    var hls = hlf.GET('hls') || null;
                    if(hls) {
                        config.params.hls = hls;
                    }
                }

                // fore onSubmit function
                config.onSubmit();

                // additional params
                p = _.merge(p, config.params);

                // send required goals
                hlf.goal(config.goalSubmit, {
                    params: p
                });

                var action = $f.attr('action'),
                    gaLinker = hlf.gaGetLinkerParam();

                var l = document.createElement('a');
                l.href = action;

                window.open (
                    action + '/?' +
                    $.param(p) + // controls params
                    (l.hostname !== location.hostname && gaLinker ? '&' + gaLinker : '') + // ga linker param
                    (config.hash ? '#' + config.hash : ''), $f.attr('target') || config.target); // hash and target (open in new window or not)
                return false;

            }
            return result;
        });

        return {
            controls: controls,

            /**
             * set/get for params
             *
             * @param name
             * @param value
             * @returns {*}
             */
            param: function (name, value) {
                if(!value) {
                    return config.params[name];
                }
                config.params[name] = value;
            }
        };

    }

})(jQuery, _, hlf);