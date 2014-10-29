;(function ($, _, hlf) {
    'use strict';

    hlf.form = function (n, controls, params, goalSubmit) {

        /**
         * set/get for params
         *
         * @param name
         * @param value
         * @returns {*}
         */
        function param(name, value) {
            if(!value) {
                return params[name];
            }
            params[name] = value;
        }

        var $f = $('[hlf-form="' + n +'"]'),
            uid = _.uniqueId(),
            tabIndex = 1;

        _.each(controls, function(control, name) {
            var config = control.getConfig();
            _.each(config, function(value, key) {
                if(_.isFunction(value)) {
                    config[key] = _.partialRight(value, controls);
                }
            });
            config.tabIndex = (uid + '') + tabIndex++;
            control.draw(name, $f, controls);
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
            param: param
        };

    }

})(jQuery, _, hlf);