$(document).ready(function() {

//Renders the cytoscape element on the page
    //with the given options
    window.cy = cytoscape({
      container: $('#csjs')[0],

      // ** NOTE: REPLACE - WITH _ SO CYTOSCAPEJS WILL RENDER PROPERTIES

      //Style properties of NODE body
      style: cytoscape.stylesheet()
      .selector('node[width]').css({
        'width': 'data(width)'
      })
      .selector('node[height]').css({
        'height': 'data(height)'
      })
      .selector('node[shape]').css({
        'shape': 'data(shape)'
      })
      .selector('node[background_color]').css({
        'background-color': 'data(background_color)'
      })
      .selector('node[background_blacken]').css({
        'background-blacken': 'data(background_blacken)'
      })
      .selector('node[background_opacity]').css({
        'border-opacity': 'data(background_opacity)'
      })
      .selector('node[border_width]').css({
        'border-width': 'data(border_width)'
      })
      .selector('node[border_style]').css({
        'border-style': 'data(border_style)'
      })
      .selector('node[border_color]').css({
        'border-color': 'data(border_color)'
      })
      .selector('node[border_opacity]').css({
        'border-opacity': 'data(border_opacity)'
      })

      //BACKGROUND IMAGE PROPERTIES
      .selector('node[background_image]').css({
        'background-image': 'data(background_image)'
      })
      .selector('node[background_image_opacity]').css({
        'background-image-opacity': 'data(background_image_opacity)'
      })
      .selector('node[background_fit]').css({
        'background-fit': 'data(background_fit)'
      })
      .selector('node[background_repeat]').css({
        'background-repeat': 'data(background_repeat)'
      })
      .selector('node[background_position_x]').css({
        'background-position-x': 'data(background_position_x)'
      })
      .selector('node[background_position_y]').css({
        'background-position-y': 'data(background_position_y)'
      })
      .selector('node[background_clip]').css({
        'background-clip': 'data(background_clip)'
      })

      //HAVE NOT DONE PIE CHART BACKGROUND

      //LABEL PROPERTIES
      .selector('node[color]').css({
        'color': 'data(color)'
      })
      .selector('node[content]').css({
        'content': 'data(content)'
      })
      .selector('node[font_family]').css({
        'font-family': 'data(font_family)'
      })
      .selector('node[font_size]').css({
        'font-size': 'data(font_size)'
      })
      .selector('node[font_style]').css({
        'font-style': 'data(font_style)'
      })
      .selector('node[font-weight]').css({
        'font-weight': 'data(font_weight)'
      })
      .selector('node[text-transform]').css({
        'text-transform': 'data(text_transform)'
      })
      .selector('node[text_wrap]').css({
        'text-wrap': 'data(text_wrap)'
      })
      .selector('node[text_max_width]').css({
        'text-max-width': 'data(text_max_width)'
      })
      .selector('node[edge_text_rotation]').css({
        'edge-text-rotation': 'data(edge_text_rotation)'
      })
      .selector('node[text-opacity]').css({
        'text-opacity': 'data(text_opacity)'
      })
      .selector('node[text_outline_color]').css({
        'text-outline-color': 'data(text_outline_color)'
      })
      .selector('node[text_outline_opacity]').css({
        'text-outline-opacity': 'data(text_outline_opacity)'
      })
      .selector('node[text_outline_width]').css({
        'text-outline-width': 'data(text_outline_width)'
      })
      .selector('node[text_shadow_blur]').css({
        'text-shadow-blur': 'data(text_shadow_blur)'
      })
      .selector('node[text_shadow_color]').css({
        'text-shadow-color': 'data(text_shadow_color)'
      })
      .selector('node[text_shadow_offset_x]').css({
        'text-shadow-offset-x': 'data(text_shadow_offset_x)'
      })
      .selector('node[text_shadow_offset_y]').css({
        'text-shadow-offset-y': 'data(text_shadow_offset_y)'
      })
      .selector('node[text_shadow_opacity]').css({
        'text-shadow-opacity': 'data(text_shadow_opacity)'
      })
      .selector('node[text_background_shape]').css({
        'text-background-shape': 'data(text_background_shape)'
      })
      .selector('node[text_border_width]').css({
        'text-border-width': 'data(text_border_width)'
      })
      .selector('node[text_border_style]').css({
        'text-border-style': 'data(text_border_style)'
      })
      .selector('node[text_border_color]').css({
        'text-border-color': 'data(text_border_color)'
      })
      .selector('node[min_zoomed_font_size]').css({
        'min-zoomed-font-size': 'data(min_zoomed_font_size)'
      })
      .selector('node[text_halign]').css({
        'text-halign': 'data(text_halign)'
      })
      .selector('node[text_valign]').css({
        'text-valign': 'data(text_valign)'
      })

      //EDGE LINE PROPERTIES
      .selector('edge[width]').css({
        'width': 'data(width)'
      })
      .selector('edge[curve_style]').css({
        'curve-style': 'data(curve_style)'
      })
      .selector('edge[haystack-radius]').css({
        'haystack-radius': 'data(haystack-radius)'
      })
      .selector('edge[control_point_step_size]').css({
        'control-point-step-size': 'data(control_point_step_size)'
      })
      .selector('edge[control_point_distance]').css({
        'control-point-distance': 'data(control_point_distance)'
      })
      .selector('edge[control_point_weight]').css({
        'control-point-weight': 'data(control_point_weight)'
      })
      .selector('edge[line_color]').css({
        'line-color': 'data(line_color)'
      })
      .selector('edge[line_style]').css({
        'line-style': 'data(line_style)'
      })

      //EDGE ARROW PROPERTIES
      .selector('edge[source_arrow_color]').css({
        'source-arrow-color': 'data(source_arrow_color)'
      })
      .selector('edge[source_arrow_shape]').css({
        'source-arrow-shape': 'data(source_arrow_shape)'
      })
      .selector('edge[source_arrow_fill]').css({
        'source-arrow-fill': 'data(source_arrow_fill)'
      })
      .selector('edge[mid_source_arrow_color]').css({
        'mid-source-arrow-color': 'data(mid_source_arrow_color)'
      })
      .selector('edge[mid_source_arrow_shape]').css({
        'mid-source-arrow-shape': 'data(mid_source_arrow_shape)'
      })
      .selector('edge[mid_source_arrow_fill]').css({
        'mid-source-arrow-fill': 'data(mid_source_arrow_fill)'
      })
      .selector('edge[target_arrow_color]').css({
        'target-arrow-color': 'data(target_arrow_color)'
      })
      .selector('edge[target_arrow_shape]').css({
        'target-arrow-shape': 'data(target_arrow_shape)'
      })
      .selector('edge[target_arrow_fill]').css({
        'target-arrow-fill': 'data(target_arrow_fill)'
      })
      .selector('edge[mid_target_arrow_color]').css({
        'mid-target-arrow-color': 'data(mid_target_arrow_color)'
      })
      .selector('edge[mid_target_arrow_shape]').css({
        'mid-target-arrow-shape': 'data(mid_target_arrow_shape)'
      })
      .selector('edge[mid_target_arrow_fill]').css({
        'mid-target-arrow-fill': 'data(mid_target_arrow_fill)'
      })
      .selector('node:selected')
        .css({
          'border-width': 3,
          'border-color': '#ff0000'
      })
      .selector('edge:selected')
        .css({
          'width': 3,
          'line-color': '#ff0000',
          'target-arrow-color': '#ff0000',
          'source-arrow-color': '#ff0000'
      }),

      ready: function() {
      	//Adding in the panzoom functionality 
      	this.panzoom();

      	// make the selection states of the elements mutable
      	this.elements().selectify();

      	// load the graph to display
  	    this.load(graph_json.graph, function(e) {
  	        console.log('working');
  	      }, function() {
  	        console.log('done');
  	    });

	    // enable user panning (hold the left mouse button to drag
      	// the screen)
      	this.userPanningEnabled(false);

        $("#move_green_right_button").click(function (e) {
         e.preventDefault();
         for (var i = 0; i < window.cy.elements().length; i++) {
          var testNode = window.cy.elements()[i];

          var nodeColor = testNode.style("background-color");

          if (nodeColor == "#01DF01") {
            var tempPosition = testNode.renderedPosition();
            testNode.renderedPosition({x:tempPosition.x + 50, y:tempPosition.y});  
          }
         }
        });

        $("#move_green_square_down_button").click(function (e) {
         e.preventDefault();
         for (var i = 0; i < window.cy.elements().length; i++) {
          var testNode = window.cy.elements()[i];
          var nodeColor = testNode.style("background-color");
          var nodeShape = testNode.style("shape");

          if (nodeColor == "#01DF01") {
            if (nodeShape == "rectangle") {
              var tempPosition = testNode.renderedPosition();
            testNode.renderedPosition({x:tempPosition.x, y:tempPosition.y + 50});  
            }
          }
         }
        });

        $("#select_purple_button").click(function (e) {
         e.preventDefault();
         for (var i = 0; i < window.cy.elements().length; i++) {
          var testNode = window.cy.elements()[i];

          var nodeColor = testNode.style("background-color");

          if (nodeColor == "#AC58FA") {
            var tempPosition = testNode.renderedPosition();
            testNode.select();
          }
         }
        });

        $("#select_circle_button").click(function (e) {
         e.preventDefault();
         for (var i = 0; i < window.cy.elements().length; i++) {
          var testNode = window.cy.elements()[i];

          var nodeShape = testNode.style("shape");

          if (nodeShape == "ellipse") {
            testNode.select();
          }
         }
        });

        $("#move_selected_down_button").click(function (e) {
         e.preventDefault();
         for (var i = 0; i < window.cy.elements().length; i++) {
          var testNode = window.cy.elements()[i];
          var nodeColor = testNode.style("background-color");
          var nodeShape = testNode.style("shape");

          if (testNode.selected()) {
            var tempPosition = testNode.renderedPosition();
            testNode.renderedPosition({x:tempPosition.x, y:tempPosition.y + 50});  
          }
         }
        });

        $("#change_selected_color_button").click(function (e) {
         e.preventDefault();
         for (var i = 0; i < window.cy.elements().length; i++) {
          var testNode = window.cy.elements()[i];

          if (testNode.selected()) {
            testNode.style("background-color", "#D8D8D8");
            testNode.style("text-outline-color", "#D8D8D8");
            testNode.style("border-color", "#D8D8D8");
          }
         }
        });

        $("#unselect_button").click(function (e) {
         e.preventDefault();
         for (var i = 0; i < window.cy.elements().length; i++) {
          var testNode = window.cy.elements()[i];
          testNode.unselect();
         }
        });

      }
    });

});