;(function ($, _, hlf) {
    'use strict';

    /**
     * Form constructor
     * @param config
     * @returns {{controls: {}, param: Function}}
     */
    hlf.form = function (config) {

        config = _.defaults(config || {}, {
            id: null,
            controls: {},
            params: {},
            goalSubmit: {}
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
                // todo controls must return an object of params
                // collect controls data
                var p = _.map(controls, function(i) {
                    return _.isFunction(i.getParams) ? i.getParams() : null;
                });
                // try to find marker in GET, then in cookie
                if(_.isUndefined(config.params.marker)) {
                    var marker = hlf.GET('marker') || hlf.cookie('marker') || null;
                    if(marker) {
                        config.params.marker = marker;
                    }
                }
                // additional params if needed
                p = p.concat(_.map(config.params, function(v, k) {
                    return k + '=' + v;
                }));
                // collect ga tracker param
                p.push(hlf.gaGetLinkerParam());
                // remove empty strings
                p = _.filter(p, function(i) {
                    return i;
                });
                hlf.goal(config.goalSubmit, {
                    params: p
                });
                window.location = $f.attr('action') + '/?' + p.join('&');
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