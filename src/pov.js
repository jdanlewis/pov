/* pov.js
 *
 */
(function (name, definition, global) {
    // play nice with jslint, AMD, and CommonJS
    /*global module: true, define: true*/
    console.log(global);
    if (typeof module != 'undefined' && module.exports) { module.exports = definition(); }
    else if (typeof global.define == 'function' && global.define.amd) { define(name, definition); }
    else { global[name] = definition(); }
}('pov', function () {

    var pov = {}, 
        gaq = function(x) { console.log(x); };  

    var setGoals = function(goals) {
        // hook up event handlers
        goals.forEach(function(goal) {
            $(goal.target).on(goal.on || "click", function() {
                var category = goal.category || goal.target.slice(1),
                    action = goal.action || "click";
                gaq(['_trackEvent', category, action, goal.opt_label, goal.opt_value, goal.opt_noninteraction]);
            });
        });
    };

    /* 
    */
    var vary = function() {
        // GA custom variable id (1..5)
        var customVar = 0;
        // compile experiments
        $('.v').forEach(function(v) {
            var variants = v.className.split(' '),
                a, b, options;
            if (variants.length < 3 || variants[1] !== "v") {
                console.warn("Experiments should be in the form 'a v c'; classname = ", v.className);
                console.warn(v);
            }
            a = variants[0];
            b = variants[2];
            pov[a] = pov[a] || {options: {}};
            options = pov[a].options;
            options[a] = a;
            options[b] = b;
        });
        // select the winners
        $.keys(pov).forEach(function(experiment) {
            var options = $.keys(pov[experiment].options),
                selected = pov[experiment].selected = options[Math.floor(options.length * Math.random())],
                name;
            // show/hide variants
            options.forEach(function(option) {
                if (option === selected) {
                    $('.' + option).removeClass('v').show();
                } else {
                    $('.' + option).hide();
                }
            });
            // get data-name if it exists
            name = $('.' + experiment)[0].getAttribute('data-name');
            name = name ? name + ": " : "";
            // add unique name based on options
            name += "[" + options.sort().join(' ') + "]";
            // set GA customVar for this experiment
            gaq(['_setCustomVar', ++customVar, name, selected]);
            if (customVar > 5) {
                console.warn("Five experiments, max!");
            }
        });
    };

    /* 
    */
    var which = function(experiment) {
        return pov[experiment] && pov[experiment].selected;
    };

    // 
    $.domReady(function() {
        if (global._gaq) {
            gaq = function(x) {
                global._gaq.push(x);
            };
        }
        vary();
    });

    //
    return {
        setGoals: setGoals,
        vary: vary,
        which: which,
        gaq: gaq
    };

}, this));
