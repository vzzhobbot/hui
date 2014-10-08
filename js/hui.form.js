;(function ($, _, hui) {
    'use strict';

    hui.form = function (n, controls, params) {

        var $f = $('[hui-form="' + n +'"]');

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
                    cd = _.map(controls, function(i) {
                        return _.isFunction(i.getParams) ? i.getParams() : null;
                    }),
                    // make params list using controls data
                    cp = _.filter(cd, function(i) {
                        return i;
                    }),
                    // make additional params list if needed
                    p = _.map(params || {}, function(v, k) {
                        return k + '=' + v;
                    });

                window.location = url + '/?' + cp.concat(p).join('&');
                return false;
            }
            return result;
        });

    }

})(jQuery, _, hui);