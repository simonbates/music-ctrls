/**
 * Created by VDESIDI on 5/1/2016.
 */

(function(config, fluid, $) {
  fluid.defaults("fluid." + config.frameworkName + ".knob", {
    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.eventedComponent"],
    model: {
      color: "#009688",
      value: 0,
      status: {
        prev: {}
      }
    },
    selectors: {
      knob: ".ctrl-circle",
      valueLabel: ".ctrl-circle-value",
      valueRing: ".ctrl-circle-cover",
      valueRingCover: ".ctrl-circle-background",
      rings: ".ctrl-circle"
    },
    events: {
      onChange: null
    },
    listeners: {
      onCreate: {
        func: "fluid." + config.frameworkName + ".knob.onCreate",
        args: ["{that}"]
      }
    },
    modelListeners: {
      "": {
        func: "fluid." + config.frameworkName + ".knob.updateUi",
        args: ["{that}", "{that}.model"]
      }
    }
  });

  fluid[config.frameworkName].knob.changeValue = function(that, newValue) {
    if (typeof newValue != "number") {
      newValue = 0;
    } else if (newValue > 100) {
      newValue = 100;
    } else if (newValue < 0) {
      newValue = 0;
    }

    that.applier.change("value", newValue);
  };

  fluid[config.frameworkName].knob.updateUi = function(that) {
    if (that.model.value <= 100 && that.model.value >= 0) {
      //Update the value in the UI
      that.locate("valueLabel").text(that.model.value + "%");

      //Update the ring arc according to the value
      var offset = ((that.model.circumference / 100) * (100 - that.model.value)) + 'px';
      that.locate("valueRing").attr('stroke-dashoffset', offset);
    }
  };

  fluid[config.frameworkName].knob.initOptions = function(that, model, input) {
    for (var key in model) {
      if (input[key] !== undefined) {
        that.applier.change(key, input[key]);
      }
    }

    var value = 0;
    if (!(!input.value || typeof input.value !== "number" || isNaN(input.value) || input.value > 100 || input.value < 0)) {
      value = Math.round(input.value);
    }
    fluid[config.frameworkName].knob.changeValue(that, value);
  };

  fluid[config.frameworkName].knob.initKnobUi = function (that) {
    var circleRadius = parseInt(that.container.find('.ctrl-circle').attr('r'));
    that.applier.change("radius", circleRadius);
    that.applier.change("circumference", 2 * that.model.radius * Math.PI);
    that.locate("rings").attr('stroke-dasharray', that.model.circumference + "px");

    if (that.model.color) {
      that.locate("valueRing").css('stroke', that.model.color);
      that.locate("valueRingCover").css('stroke', that.model.color);
      that.locate("valueRing").css('fill', that.model.color);
      that.locate("valueRingCover").css('fill', that.model.color);
      that.locate("valueLabel").css('fill', that.model.color);
    }

    fluid[config.frameworkName].knob.updateUi(that, that.model);
  };

  fluid[config.frameworkName].knob.onCreate = function (that) {
    that.container.html(htmlTempl.templates["src/templates/ringCtrl.html"]);
    fluid[config.frameworkName].knob.initOptions(that, that.model, that.options);
    fluid[config.frameworkName].knob.initKnobUi(that);

    function updateValue(newValue) {
      fluid[config.frameworkName].knob.changeValue(that, newValue);
    }

    function endFocus() {
      that.locate("rings").css('animation', '');
      that.locate("rings").css('animation', 'rotate 0.5s');
      setTimeout(function() {
        that.locate("rings").css('animation', '');
      }, 1000);
    }

    that.container.bind('keydown', function(evt) {
      if (evt.keyCode == 38) {
        updateValue(that.model.value + 1);
        return false;
      } else if (evt.keyCode == 40) {
        updateValue(that.model.value - 1);
        return false;
      } else {
        return;
      }
    });

    that.container.bind('mousemove', '.ctrl', function(evt) {
      if (that.model.status.mousedown) {
        if (that.model.status.prev.pageY > evt.pageY) {
          updateValue(that.model.value + 1);
        } else if(that.model.status.prev.pageY < evt.pageY) {
          updateValue(that.model.value - 1);
        }
      }

      that.applier.change("status.prev", {pageX: evt.pageX, pageY: evt.pageY});
    });


    /**
     Mouse wheel event
     Ref : http://stackoverflow.com/questions/8189840/get-mouse-wheel-events-in-jquery
     */
    //Firefox
    that.container.bind('mousewheel', '.ctrl', function(e){
      if (that.model.status.mousedown) {
        if (e.originalEvent.wheelDelta < 0) {
          //scroll down
          updateValue(that.model.value - 1);
        } else {
          //scroll up
          updateValue(that.model.value + 1);
        }
      }

      //prevent page fom scrolling
      return false;
    });

    //IE, Opera, Safari
    that.container.bind('DOMMouseScroll', '.ctrl', function(e){
      if (e.originalEvent.wheelDelta < 0) {
        //scroll down
        updateValue(that.model.value - 1);
      } else {
        //scroll up
        updateValue(that.model.value + 1);
      }

      //prevent page fom scrolling
      return false;
    });


    that.container.bind('mousedown', '.ctrl', function(evt) {
      that.applier.change("status.mousedown", true);
      that.applier.change("status.prev", {pageX: evt.pageX, pageY: evt.pageY});
    });

    that.container.bind('mouseup mouseleave', '.ctrl', function(evt) {
      that.applier.change("status.mousedown", false);
      endFocus();
    });

    that.container.bind('focusout blur', function(evt) {
      that.applier.change("status.mousedown", false);
      endFocus();
    });
  };

})(config, fluid, $);