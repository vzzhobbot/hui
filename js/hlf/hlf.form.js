;(function ($, _, hlf) {
    'use strict';

    hlf.form = function (n, controls, params) {

        var $f = $('[hlf-form="' + n +'"]');

        _.each(controls, function(control, name) {
            var config = control.getConfig();
            _.each(config, function(value, key) {
                if(_.isFunction(value)) {
                    config[key] = _.partialRight(value, controls);
                }
            });
            control.draw(name, $f, controls);
            // todo set control tab index
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

                // collect ga tracker param
                if(typeof ga !== 'undefined' && _.isFunction(ga)) {
                    ga(function(tracker) {
                        ap.push(tracker.get('linkerParam'));
                    });
                }

                window.location = url + '/?' + cp.concat(ap).join('&');
                return false;
            }
            return result;
        });

    }

})(jQuery, _, hlf);