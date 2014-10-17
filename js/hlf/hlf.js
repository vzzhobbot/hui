;(function ($, _, context) {
    'use strict';

    function hlf () {
        // ...
    }

    hlf.getTpl = _.memoize(function (id) {
        var obj = $('#' + id);
        if(!obj.length) {
            console.log('there is no hlf.tpl \'' + id + '\' in dom');
            return '';
        }
        return _.template(obj.html());
    });

    hlf.getEl = function($c, role, name) {
        var selector = '[hlf-role="' + role + '"]';
        if(name) {
            selector += '[hlf-name="' + name +'"]';
        }
        return $c.find(selector);
    };

    hlf.getContainer = function($c, place, value) {
        return $c.find('[hlf-' + place + '="' + value + '"]');
    };

    context.hlf = hlf;

})(jQuery, _, window);