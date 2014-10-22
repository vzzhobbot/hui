;(function ($, _, hlf) {
    'use strict';

    hlf.form = function (n, controls, params, gaEvent) {

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
            tabIndex = 1;

        _.each(controls, function(control, name) {
            var config = control.getConfig();
            _.each(config, function(value, key) {
                if(_.isFunction(value)) {
                    config[key] = _.partialRight(value, controls);
                }
            });
            config.tabIndex = tabIndex++;
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

                var url = $f.attr('action'),
                    // collect controls data
                    controlsData = _.map(controls, function(i) {
                        return _.isFunction(i.getParams) ? i.getParams() : null;
                    }),
                    // controls params
                    cp = _.filter(controlsData, function(i) {
                        return i;
                    }),
                    // additional params if needed
                    ap = _.map(params || {}, function(v, k) {
                        return k + '=' + v;
                    });

                if(typeof ga !== 'undefined' && _.isFunction(ga)) {
                    hlf.ga.event(gaEvent);
                    // collect ga tracker param
                    ap.push(hlf.ga.getLinkerParam());
                }

                window.location = url + '/?' + cp.concat(ap).join('&');
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