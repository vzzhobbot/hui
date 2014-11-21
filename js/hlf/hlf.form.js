;(function ($, _, hlf) {
    'use strict';

    /**
     * Form constructor
     *
     * @param id form uid hlf-form="maForm"
     * @param cs control constructors list
     * @param params additional url params
     * @param goalSubmit goal submit config
     * @returns {{controls: {}, param: Function}}
     */
    hlf.form = function (id, cs, params, goalSubmit) {

        var $f = $('[hlf-form="' + id +'"]'),
            uid = _.uniqueId(),
            tabIndex = 1,
            controls = {};

        // draw each control
        _.each(cs, function(c, n) {
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
                var p =
                    // collect controls data
                    _.map(controls, function(i) {
                        return _.isFunction(i.getParams) ? i.getParams() : null;
                    })
                    // additional params if needed
                    .concat(_.map(params || {}, function(v, k) {
                        return k + '=' + v;
                    }));
                // collect ga tracker param
                p.push(hlf.gaGetLinkerParam());
                // remove empty strings
                p = _.filter(p, function(i) {
                    return i;
                });
                hlf.goal(goalSubmit, {
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
                    return params[name];
                }
                params[name] = value;
            }
        };

    }

})(jQuery, _, hlf);