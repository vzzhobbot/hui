;(function ($, _, hui) {
    'use strict';
    hui.guests = function (config) {

        var $c = null, // container
            $s = null, // summary
            $cc = null, // controls container
            $av = null, // adults value
            $ai = null, // adults increment control
            $ad = null, // adults decrement control
            $cv = null, // children value
            $ci = null, // children increment control
            $cd = null, // children decrement control
            $cl = null, // children list
            $chc = [], // child containers
            $chiw = [], // child input wraps
            $chi = [], // child inputs
            $chh = [], // child hints
            controls = {};
        config = _.defaults(config || {}, {
            adultsMax: 4,
            adultsMin: 1,
            adults: 2,
            children: [],
            childrenMax: 3,
            childMaxAge: 17,
            adultsTitle: 'Adults',
            childrenTitle: 'Children',
            childHintText: 'Check da age!',
            summary: function(adults, children) {
                return (adults + children.length);
            }
        });

        /**
         * Returns (if possible) this control value as string to use in URL
         * @returns {string|null}
         */
        function getParams() {
            var str = 'adults=' + config.adults;
            if(config.children.length) {
                str += '&children=' + config.children.join(',');
            }
            return str;
        }

        function validate() {
            // collect errors
            var r = _.filter(config.children, function(age, k) {
                var e = (age === null || parseInt(age) < 0 || parseInt(age) > config.childMaxAge);
                if(!e) {
                    $chh[k].hide();
                }
                return e;
            });
            // show hint of first error
            if(r.length) {
                _.each(r, function(v, k) {
                    $chi[k].focus();
                    $chh[k].show();
                    return false;
                });
                return false;
            }
            return true;
        }

        /**
         * Draws control in DOM
         * @param name string [hui-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         */
        function draw(name, $f, c) {
            controls = c || {};
            $c = hui.getEl($f, 'guests', name);
            $c.html(hui.getTpl('hui-guests')(config));
            $s = hui.getEl($c, 'summary');
            $cc = hui.getEl($c, 'controls');
            $av = hui.getEl($c, 'adults-val');
            $ad = hui.getEl($c, 'adults-decrement');
            $ai = hui.getEl($c, 'adults-increment');
            $cv = hui.getEl($c, 'children-val');
            $cd = hui.getEl($c, 'children-decrement');
            $ci = hui.getEl($c, 'children-increment');
            $cl = hui.getEl($c, 'children-list');
            _.each(config.children, function(v, key) {
                drawChild(key);
            });
            update();

            $s.on('click', function() {
                $cc.toggleClass('hui-state--hidden');
            });

            $ai.on('click', function() {
                if(config.adults == config.adultsMax) {
                    return false;
                }
                config.adults++;
                update();
                return false;
            });

            $ad.on('click', function() {
                if(config.adults == config.adultsMin) {
                    return false;
                }
                config.adults--;
                update();
                return false;
            });

            $ci.on('click', function() {
                if(config.children.length == config.childrenMax) {
                    return false;
                }
                config.children.push(null);
                drawChild(config.children.length - 1);
                update();
                return false;
            });

            $cd.on('click', function() {
                if(config.children.length == 0) {
                    return false;
                }
                $chc[config.children.length - 1].remove();
                config.children.pop();
                $chc.pop();
                $chiw.pop();
                $chi.pop();
                $chh.pop();
                update();
                return false;
            });

        }

        function drawChild(key) {

            $cl.append(hui.getTpl('hui-guests-child')({
                key: key,
                age: config.children[key],
                hintText: config.childHintText
            }));

            $chc[key] = hui.getEl($cl, 'child-container', key);
            $chiw[key] = hui.getEl($chc[key], 'input-wrap');
            $chi[key] = hui.getEl($chc[key], 'input');
            $chh[key] = hui.getEl($chc[key], 'hint');


            $chi[key].on('keyup', function() {
                var val = $chi[key].val().trim();
                if(!val.length || !_.isFinite(val)) {
                    config.children[key] = null;
                } else {
                    config.children[key] = parseInt(val);
                }
            });

            $chi[key].on('keydown', function(e) {
                $chh[key].hide();
            });

            $chi[key].on('focus', function() {
                $chh[key].hide();
            });

            $chh[key].on('click', function() {
                $chh[key].hide();
            });
        }

        function update() {
            $s.html(config.summary(config.adults, config.children));
            $av.html(config.adults);
            $cv.html(config.children.length);

            config.children.length
                ? $cl.removeClass('hui-state--empty')
                : $cl.addClass('hui-state--empty');

            config.children.length == config.childrenMax
                ? $ci.addClass('hui-state--disabled')
                : $ci.removeClass('hui-state--disabled');

            !config.children.length
                ? $cd.addClass('hui-state--disabled')
                : $cd.removeClass('hui-state--disabled');

            config.adults == config.adultsMax
                ? $ai.addClass('hui-state--disabled')
                : $ai.removeClass('hui-state--disabled');

            config.adults == config.adultsMin
                ? $ad.addClass('hui-state--disabled')
                : $ad.removeClass('hui-state--disabled');

        }

        /**
         * Returns control config object
         * @returns {*}
         */
        function getConfig() {
            return config;
        }

        return {
            draw: draw,
            getParams: getParams,
            getConfig: getConfig,
            validate: validate
        };

    };
})(jQuery, _, hui);