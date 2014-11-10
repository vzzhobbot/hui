;(function ($, _, hlf) {
    'use strict';
    hlf.guests = function (config) {

        var $c = null, // container
            $doc = null, // document
            $g = null, // guests container
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
            goalOpen: {},
            adultsMax: 4,
            adultsMin: 1,
            adults: 2, // adults value
            children: [], // children age
            childrenMax: 3,
            childMaxAge: 17,
            adultsTitle: 'Adults',
            childrenTitle: 'Children',
            childHint: 'Check da age!',
            summary: function(adults, children) {
                return (adults + children.length);
            },
            tplContainer: hlf.getTpl('guests.container'),
            tplChild: hlf.getTpl('guests.child')
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
            // validate each field
            var r = _.map(config.children, function(age, key) {
                var ok = !(age === null || parseInt(age) < 0 || parseInt(age) > config.childMaxAge);
                if(ok) {
                    $chiw[key].removeClass('hlf-state--error');
                }
                return ok;
            });
            // show hint of first error
            _.each(r, function(ok, key) {
                if(!ok) {
                    $chi[key].focus();
                    $chiw[key].addClass('hlf-state--error');
                    return false;
                }
            });
            // count error results
            return !_.filter(r, function(ok) {
                return !ok;
            }).length;
        }

        function summaryClick() {
            $g.hasClass('hlf-state--closed') ? guestsOpen() : guestsClose();
            return false;
        }

        function guestsClose() {
            $g.addClass('hlf-state--closed');
            $g.removeClass('hlf-state--focus');
        }

        function guestsOpen() {
            hlf.goal(config.goalOpen);
            $g.removeClass('hlf-state--closed');
            $g.addClass('hlf-state--focus');
        }

        /**
         * @param name string [hlf-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         * @param ti tabIndex value
         */
        function draw(name, $f, c, ti) {

            controls = c || {};
            config.tabIndex = ti || 0;

            $doc = $(document);
            $c = hlf.getContainer($f, 'guests', name);
            $c.html(config.tplContainer(config));
            $g = hlf.getEl($c, 'guests');
            $s = hlf.getEl($c, 'summary');
            $cc = hlf.getEl($c, 'controls');
            $av = hlf.getEl($c, 'adults-val');
            $ad = hlf.getEl($c, 'adults-decrement');
            $ai = hlf.getEl($c, 'adults-increment');
            $cv = hlf.getEl($c, 'children-val');
            $cd = hlf.getEl($c, 'children-decrement');
            $ci = hlf.getEl($c, 'children-increment');
            $cl = hlf.getEl($c, 'children-list');
            _.each(config.children, function(v, key) {
                drawChild(key);
            });
            update();

            $doc.on('click', function(ev) {
                if(!$(ev.target).closest('[hlf-role=guests]').length) {
                    guestsClose();
                }
                ev.stopPropagation();
            });

            $s.on('click', summaryClick);

            $s.on('keydown', function(e) {
                switch(e.keyCode) {
                    case 38:
                        guestsClose();
                        break;
                    case 40:
                        guestsOpen();
                        break;
                    default: break;
                }
            });

            $s.on('focus', function() {
                $s.addClass('hlf-state--focus');
            });

            $s.on('blur', function() {
                $s.removeClass('hlf-state--focus');
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

            return {
                getParams: getParams,
                getConfig: getConfig,
                validate: validate
            };

        }

        function drawChild(key) {

            $cl.append(config.tplChild({
                key: key,
                age: config.children[key],
                hint: config.childHint
            }));

            $chc[key] = hlf.getEl($cl, 'child-container', key);
            $chiw[key] = hlf.getEl($chc[key], 'input-wrap');
            $chi[key] = hlf.getEl($chc[key], 'input');
            $chh[key] = hlf.getEl($chc[key], 'hint');

            $chi[key].on('focus', function() {
                $chiw[key].addClass('hlf-state--focus');
                $chiw[key].removeClass('hlf-state--error');
            });

            $chi[key].on('blur', function() {
                $chiw[key].removeClass('hlf-state--focus');
            });

            $chi[key].on('keyup', function() {
                var val = $chi[key].val().trim();
                if(!val.length || !_.isFinite(val)) {
                    config.children[key] = null;
                } else {
                    config.children[key] = parseInt(val);
                }
            });

            $chi[key].on('keydown', function(e) {
                $chiw[key].removeClass('hlf-state--error');
            });

            $chh[key].on('click', function() {
                $chiw[key].removeClass('hlf-state--error');
            });

            if(config.children[key] == null) {
                $chi[key].focus();
            }

        }

        function update() {
            $s.html(config.summary(config.adults, config.children));
            $av.html(config.adults);
            $cv.html(config.children.length);

            config.children.length
                ? $cl.removeClass('hlf-state--empty')
                : $cl.addClass('hlf-state--empty');

            config.children.length == config.childrenMax
                ? $ci.addClass('hlf-state--disabled')
                : $ci.removeClass('hlf-state--disabled');

            !config.children.length
                ? $cd.addClass('hlf-state--disabled')
                : $cd.removeClass('hlf-state--disabled');

            config.adults == config.adultsMax
                ? $ai.addClass('hlf-state--disabled')
                : $ai.removeClass('hlf-state--disabled');

            config.adults == config.adultsMin
                ? $ad.addClass('hlf-state--disabled')
                : $ad.removeClass('hlf-state--disabled');

        }

        /**
         * Returns control config object
         * @returns {*}
         */
        function getConfig() {
            return config;
        }

        return draw;

    };
})(jQuery, _, hlf);