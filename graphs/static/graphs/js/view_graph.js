/* 
This function is executed when the page finishes loading.
Consult the API: http://api.jquery.com/ready/
*/
$(document).ready(function() {
    // Cytoscape.js API: 
    // http://cytoscape.github.io/cytoscape.js/

    //Renders the cytoscape element on the page
    //with the given options
    window.cy = cytoscape({
      container: $('#csjs')[0],

      style: cytoscape.stylesheet()
      .selector('node')
        .css({
          //name to display
          'content': 'data(label)', 
          'shape': 'data(shape)',
          'text-valign': 'center',
          'color': '#000000',
          'text-outline-width': 0,
          'background-color': 'data(color)', 
          'font-size': 15,
          'border-color': '#000000',
          'border-width': 1,
          'width': 'data(width)',
          'height': 'data(height)'
        })
      .selector('edge')
        .css({
          'target-arrow-shape': 'triangle',
          'line-color': 'data(color)',
          'source-arrow-color': 'data(color)',
          'target-arrow-color': 'data(color)',
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
    
    // default layout set to be concentric
    layout: getLayoutFromQuery(),
    
    // draw graph, handle events etc.
    ready: function(){

      //Adding in the panzoom functionality 
      this.panzoom();
      
      // make the selection states of the elements mutable
      this.elements().selectify();

      // DONE SO OLD GRAPHS WILL DISPLAY
      //If the nodes in graphs already in database don't have width or height
      // or unrecognized shape, have a default value
      for (var i = 0; i < graph_json['graph']['nodes'].length; i++) {
        var nodeData = graph_json['graph']['nodes'][i]['data'];
        
        if (nodeData['height'] == undefined) {
          nodeData['height'] = 50
        }

        if (nodeData['width'] == undefined) {
          nodeData['width'] = 50
        }

        //VALUES CONSISTENT AS OF CYTOSCAPEJS 2.3.9
        var acceptedShapes = ["rectangle", "roundrectangle", "ellipse", "triangle", "pentagon", "hexagon", "heptagon", "octagon", "star"];

        if (acceptedShapes.indexOf(nodeData['shape'].toLowerCase()) == -1) {

          if (nodeData['shape'].toLowerCase() == 'diamond') {
            nodeData['shape'] = 'octagon';
          } else if (nodeData['shape'] == 'square') {
            if (nodeData['label'].length == 0) {
              nodeData['shape'] = 'rectangle';
              nodeData['height'] = 20;
              nodeData['width'] = 20;
            } else {
              nodeData['shape'] = "rectangle"
            }

          } else {
            nodeData['shape'] = 'ellipse';
          }
        } else {
          nodeData['shape'] = nodeData['shape'].toLowerCase();
        }

        if (nodeData['color'] == undefined) {
          nodeData['color'] = "yellow";
        } else {
           var hexCode = colourNameToHex(nodeData['color']);
           if (hexCode != false) {
            nodeData['color'] = hexCode;
            console.log(hexCode);
           } else {
            if (isHexaColor(addCharacterToHex(nodeData['color']))) {

              nodeData['color'] = addCharacterToHex(nodeData['color']);
            }
           }
        }
      }

      // DONE SO OLD GRAPHS WILL DISPLAY
      //If the EDGES in graphs already in database don't have color have a default value
      for (var i = 0; i < graph_json['graph']['edges'].length; i++) {
        var edgeData = graph_json['graph']['edges'][i]['data'];

        if (edgeData['color'] == undefined) {
          edgeData['color'] = "black";
        } else {
          var hexCode = colourNameToHex(edgeData['color']);
           if (hexCode != false) {
            edgeData['color'] = hexCode;
           } else {
            if (isHexaColor(addCharacterToHex(edgeData['color']))) {
              edgeData['color'] = addCharacterToHex(edgeData['color']);
            }
           }
        }
      }

      // load the graph to display
      this.load(graph_json.graph);

      // enable user panning (hold the left mouse button to drag
      // the screen)
      this.userPanningEnabled(false);
      
      // display node data as a popup
      this.on('tap', function(evt){
        // get target
        var target = evt.cyTarget;
        // target some element other than background (node/edge)
        if ( target !== this ) {
            var popup = target._private.data

            if (popup == null) {
                return;
            }

            $('#dialog').html(popup);
            if (target._private.data.popup != null && target._private.data.popup.length > 0) {
              $("#dialog").html("<p>" + target._private.data.popup + "</p>");
            }
            if (target._private.group == 'edges') {
              $('#dialog').dialog('option', 'title', target._private.data.source + "->" + target._private.data.target);
            } else {
              $('#dialog').dialog('option', 'title', target.data('label'));
            }
            $('#dialog').dialog('open');
        }
      });


      //If ther are any terms to be searched for, highlight those terms, if found
      var searchTerms = getQueryVariable("search");
      if (searchTerms) {
        searchValues(searchTerms);
      }

    } // end ready: function()
    });

    cy.boxSelectionEnabled(true);

    //setup popup dialog for displaying dialog when nodes/edges
    //are clicked for information.
    $('#dialog').dialog({ autoOpen: false });

    //these accordions make up the side menu
    $('#accordion_graph_details').accordion({
        collapsible: true,
        active: false
    });

    $('#accordion_export').accordion({
        collapsible: true,
        active: false 
    });

    $("#accordion_search").accordion({
        collapsible: true,
        active: true
    });

    $('#accordion_owner').accordion({
        collapsible: true,
        active: false 
    });

    $('#accordion_sharing').accordion({
        collapsible: true,
        active: false 
    });

    $('#accordion_layouts').accordion({
        collapsible: true,
        heightStyle: "content"
    });

    $('#accordion_filters').accordion({
        collapsible: true,
        heightStyle: "content"
    });

    //When save layout button is clicked
    $("#save_layout").click(function(e) {
      e.preventDefault();

      //Replaces all spaces with '_' character for ease of saving
      var layoutName = $("#layout_name").val();
      if (layoutName && layoutName.length > 0) {
        layoutName = layoutName.replace(" ", "_");
      }

      //When save is clicked, it gets location of all the nodes and saves it
      //so that nodes can be placed in this location later on
      var nodes = window.cy.elements('node');
      var layout = [];
      for (var i = 0; i < Object.keys(nodes).length - 2; i++) {
         var nodeData = {
          'x': nodes[i]._private.position.x,
          'y': nodes[i]._private.position.y,
          'id': nodes[i]._private.data.id
         };
         layout.push(nodeData);
      }

      //Posts information to the server regarding the current display of the graph,
      //including position
      $.post("layout/", {
        layout_id: "1",
        layout_name: layoutName,
        points: JSON.stringify(layout),
        loggedIn: $("#loggedIn").text(),
        "public": 0,
        "unlisted": 0
      }, function (data) {
        var layoutUrl = window.location.pathname + "?layout=" + layoutName;
        window.location.replace(layoutUrl);
      });
    });

    //Searches for the element inside the graph

    $("#search_button").click(function(e) {
      e.preventDefault();
      if ($("#search").val().length > 0) {
        searchValues($("#search").val());
      }
    });

    //Unhighlights terms when the buttons in the search box is clicked on
    $("#search_terms").on("click", ".search", function(e) {
      unselectTerm($(this).attr('id'));
      var toRemove  = encodeURIComponent($(this).val()) + ',';
      var origText = $("#url").text();
      origText = origText.replace(toRemove, '');
      $("#url").text(origText);
      $(this).remove();
      var toSearchFor = origText.indexOf('search=')
      var nextVal = origText.substring(toSearchFor).replace('search=', '');
      if ($(".search").length == 0) {
        $("#url").text("");
      }
    });

    $(".highlight").click(function (e) {
      e.preventDefault();
      var searchTerms = getHighlightedTerms();
      if (searchTerms.length > 0) {
        var linkHref = $(this).attr('id') + '&search=' + getHighlightedTerms();
      } else {
        var linkHref = $(this).attr('id');
      }

      $("#layout_link").attr('href', linkHref);
      $("#layout_link").text("Link to this graph with highlighted elements");
      $("#layout_link").width(20);
    });

    $(".change").click(function (e) {
      e.preventDefault();
      $("#change_modal").modal('toggle');
      $("#change_layout").val($(this).val());
    });

    $("#change_layout").click(function (e) {
      var paths = document.URL.split('/')
      var new_layout_name = $("#new_layout_name").val();

      if (new_layout_name.length == 0) {
        return alert("Enter a new layout name!");
      } else {
        $.post('../../../changeLayoutName/', {
          "gid": decodeURIComponent(paths[paths.length - 2]),
          "uid": decodeURIComponent(paths[paths.length - 3]),
          "loggedIn": $("#loggedIn").text(),
          "old_layout_name": $(this).val(),
          "new_layout_name": new_layout_name
        }, function (data) {
          window.location.href = data.url; 
        });
      }
    });

    $(".remove").click(function (e) {
      e.preventDefault();

      var paths = document.URL.split('/')
      var publicLayout = $(this).val();
      var userId = $("#loggedIn").text();
      var ownerId = decodeURIComponent(paths[paths.length - 3])
      var gid = decodeURIComponent(paths[paths.length - 2])

      $.post('../../../deleteLayout/', {
        'gid': gid,
        'owner': ownerId,
        'layout': publicLayout,
        'user_id': userId
      }, function (data) {
        window.location.href = data.url;
      })
    });

    $(".layout_links").tooltip();

    $(".layout_buttons").click(function (e) {
      e.preventDefault();
      var searchTerms = getHighlightedTerms();
      if (searchTerms.length > 0) {
        var linkHref = $(this).attr('href') + '&search=' + getHighlightedTerms();
      } else {
        var linkHref = $(this).attr('href');
      }

      if (e.target == this) {
        window.location.href = linkHref;
      }

    });

    $(".public").click(function (e) {
      e.preventDefault();

      var paths = document.URL.split('/');
      var publicLayout = $(this).val();
      var userId = $("#loggedIn").text();
      var ownerId = decodeURIComponent(paths[paths.length - 3]);
      var gid = decodeURIComponent(paths[paths.length - 2]);

      $.post('../../../shareLayoutWithGroups/', {
        'layoutId': $(this).val(),
        'gid': gid,
        'owner': ownerId,
        'uid': userId
      }, function (data) {
        window.location.reload();
      });

      // $.post('../../../makeLayoutPublic/', {
      //   'gid': gid,
      //   'owner': ownerId,
      //   'layout': publicLayout,
      //   'user_id': userId
      // }, function (data) {
      //   window.location.reload();
      // });

      // $.post("../../../getGroupsWithLayout/", {
      //   "layout": publicLayout,
      //   "loggedIn": userId,
      //   "gid": gid,
      //   "owner": ownerId
      // }, function (data) {
      //   var layout_options = "";
      //   if (data['Group_Information'].length > 0) {
      //     for (var i = 0; i < data['Group_Information'].length; i++) {
      //       if (data['Group_Information'][i]['2'] == true) {
      //         if (ownerId == userId || data['Group_Information'][i]['1'] == userId) {
      //           layout_options += '<li class="list-group-item layout" style="font-size: 15px;"><label><input type="checkbox" class="layout_val" checked="checked" style="margin-right: 30px;" value="' + data['Group_Information'][i]['0'] + '12345__43121__' + data['Group_Information'][i][1] + '">' + data['Group_Information'][i][0] + " owned by: " + data['Group_Information'][i][1] + '</label></li>';
      //         } else {
      //           layout_options += '<li class="list-group-item layout" style="font-size: 15px;"><label>' + data['Group_Information'][i][0] + " owned by: " + data['Group_Information'][i][1] + '</label></li>';
      //         }
      //       } else {
      //         if (ownerId == userId || data['Group_Information'][i]['1'] == userId) {
      //           layout_options += '<li class="list-group-item layout" style="font-size: 15px;"><label><input type="checkbox" class="layout_val" style="margin-right: 30px;" value="' + data['Group_Information'][i][0] + '12345__43121__' + data['Group_Information'][i][1] + '">' + data['Group_Information'][i][0] + " owned by: " + data['Group_Information'][i][1] + '</label></li>';
      //         } else {
      //           layout_options += '<li class="list-group-item layout" style="font-size: 15px;"><label>' + data['Group_Information'][i][0] + " owned by: " + data['Group_Information'][i][1] + '</label></li>';
      //         }
      //       }
      //     }
      //   } else {
      //     layout_options += "You are not part of any groups"
      //   }

      //   layout_options += "<p style='display: none;' id='layoutId'>" + publicLayout + "</p>";

      //   $(".checked-list-box").html(layout_options);
      //   $(".layout_val").click(function(e) {
      //       $(this).prop('checked');
      //   });
      // });
    });

    $("#share_graph").click(function (e) {
      e.preventDefault();

      var paths = document.URL.split('/')
      var publicLayout = $(this).val();
      var userId = $("#loggedIn").text();
      var ownerId = decodeURIComponent(paths[paths.length - 3])
      var gid = decodeURIComponent(paths[paths.length - 2])

      $.post('../../../getGroupsForGraph/', {
        'gid': gid,
        'owner': ownerId,
      }, function (data) {
        var group_options = "";
        if (data['Group_Information'].length > 0) {
          for (var i = 0; i < data['Group_Information'].length; i++) {
            if (data['Group_Information'][i]['graph_shared'] == true) {
              if (ownerId == userId || data['Group_Information'][i]['group_owner'] == userId) {
                group_options += '<li class="list-group-item groups" style="font-size: 15px;"><label><input type="checkbox" class="group_val" checked="checked" style="margin-right: 30px;" value="' + data['Group_Information'][i]['group_id'] + '12345__43121__' + data['Group_Information'][i]['group_owner'] + '">' + data['Group_Information'][i]['group_id'] + " owned by: " + data['Group_Information'][i]['group_owner'] + '</label></li>';
              } 
              // else {
              //   group_options += '<li class="list-group-item groups" style="font-size: 15px;"><label>' + data['Group_Information'][i]['group_id'] + " owned by: " + data['Group_Information'][i]['group_owner'] + '</label></li>';
              // }
            } else {
              if (ownerId == userId || data['Group_Information'][i]['group_owner'] == userId) {
                group_options += '<li class="list-group-item groups" style="font-size: 15px;"><label><input type="checkbox" class="group_val" style="margin-right: 30px;" value="' + data['Group_Information'][i]['group_id'] + '12345__43121__' + data['Group_Information'][i]['group_owner'] + '">' + data['Group_Information'][i]['group_id'] + " owned by: " + data['Group_Information'][i]['group_owner'] + '</label></li>';
              } 
              // else {
              //   group_options += '<li class="list-group-item groups" style="font-size: 15px;"><label>' + data['Group_Information'][i]['group_id'] + " owned by: " + data['Group_Information'][i]['group_owner'] + '</label></li>';
              // }
            }
          }
        } else {
          group_options += "You are not part of any groups"
        }


        $(".checked-list-box").html(group_options);

        $(".group_val").click(function(e) {
          $(this).prop('checked');
        });

      });

    });

    $("#share_layout_with_selected_groups").click(function(e) {
      var paths = document.URL.split('/')
      var ownerId = decodeURIComponent(paths[paths.length - 3])
      var gid = decodeURIComponent(paths[paths.length - 2])

      // var all_groups = {}
      // var groups_to_share_with = [];
      // var groups_not_to_share_with = [];

      // $(".layout_val").each(function() {
      //     all_groups[$(this).val()] = $(this).is(":checked");
      // });


      // for (var key in all_groups) {
      //   if (all_groups[key] == true) {
      //     groups_to_share_with.push(key);
      //   } else {
      //     groups_not_to_share_with.push(key);
      //   }
      // }

      // console.log(groups_to_share_with);
      // console.log(groups_not_to_share_with);

      $.post('../../../shareLayoutWithGroups/', {
        'layoutId': $("#layoutId").text(),
        'gid': gid,
        'owner': ownerId
        // 'groups_to_share_with' : groups_to_share_with,
        // 'groups_not_to_share_with': groups_not_to_share_with
      }, function (data) {
        console.log(data);
        // window.location.reload();
      });
    });


    $("#share_graph_with_selected_groups").click(function (e) {
      var paths = document.URL.split('/')
      var ownerId = decodeURIComponent(paths[paths.length - 3])
      var gid = decodeURIComponent(paths[paths.length - 2])

      var all_groups = {}
      var groups_to_share_with = [];
      var groups_not_to_share_with = [];

      $(".group_val").each(function() {
        if (all_groups.hasOwnProperty($(this).val()) == false) {
          all_groups[$(this).val()] = $(this).is(":checked");
        }
      });


      for (var key in all_groups) {
        if (all_groups[key] == true) {
          groups_to_share_with.push(key);
        } else {
          groups_not_to_share_with.push(key);
        }
      }

      $.post('../../../shareGraphWithGroups/', {
        'gid': gid,
        'owner': ownerId,
        'groups_to_share_with' : groups_to_share_with,
        'groups_not_to_share_with': groups_not_to_share_with
      }, function (data) {
        window.location.reload();
      });
    });

    $("#input_k").val(getLargestK(graph_json.graph));
    $("#input_max").val(getLargestK(graph_json.graph));

    $("#slider_max").slider({
      step:1,
      min: 0,
      max: getLargestK(graph_json.graph),
      value: getLargestK(graph_json.graph),
      slide: function (event, ui) {
          $("#input_max").val(ui.value);
          m_val = ui.value;
          if (m_val < 0) {
            m_val = 0;
            $(this).slider({ value: 0 });
          } else {
            $(this).slider({value: m_val});
            $("#slider").slider({max: m_val});
            $("#input_k").val($("#slider").slider('value'));
          }
        },
        change: function (event, ui) {
            if (event.originalEvent) {
              applyMax(graph_json.graph)
            }
          }
    });

    $("#slider").slider({
      value: $("#slider_max").slider('value'),
      max: $("#slider_max").slider('value'),
      min: 0,
      step: 1,
      slide: function (event, ui) {
        $("#input_k").val(ui.value);
        m_val = ui.value;
        if (m_val < 0) {
          m_val = 0;
          $(this).slider({ value: 0 });
        }
      },
      change: function (event, ui) {
          if (event.originalEvent) {
            showOnlyK();
          }
        }
    });
});

//Exports the specified graph to an image
//Appears in side window 
function export_graph(graphname) {
    var png = window.cy.png();

    var download = document.createElement('a');
    download.href = png;
    download.download = graphname + ".png";
    fireEvent(download, 'click')
}

//This is needed to launch events in Mozilla browser
function fireEvent(obj,evt){
  var fireOnThis = obj;
  if(document.createEvent ) {
    var evObj = document.createEvent('MouseEvents');
    evObj.initEvent( evt, true, false );
    fireOnThis.dispatchEvent( evObj );
  } else if( document.createEventObject ) {
    var evObj = document.createEventObject();
    fireOnThis.fireEvent( 'on' + evt, evObj );
  }
}

//Function to search through graph elements in order to highlight the 
//appropriate one
function searchValues(labels) {
  //split paths
  var paths = document.URL.split('/');

  var highlightedTerms = Array();

  //posts to server requesting the id's from the labels
  //so cytoscape will recognize the correct element
  $.post("../../../retrieveIDs/", {
    'values': labels,
    "gid": decodeURIComponent(paths[paths.length - 2]),
    "uid": decodeURIComponent(paths[paths.length - 3]) 
  }, function (data) {

    //Split the labels so we can reference the labels
    labels = labels.split(',');

    //It selects those nodes that have labels as their ID's
    ids = JSON.parse(data)['IDS'];

    //For everthing else, we get correct id's from server and proceed to highlight those id's 
    //by correlating labels to id's
    for (var j = 0; j < ids.length; j++) {
      if (ids[j].length > 0) {

        if (window.cy.$('[id="' + ids[j] + '"]').selected() == false) {
          // Select the specified element and don't allow the user to unselect it until button is clicked again
          if (window.cy.$('[id="' + ids[j] + '"]').isEdge()) {
            window.cy.$('[id="' + ids[j] + '"]').css({'line-color': 'blue', 'line-style': 'dotted', 'width': 10});
            highlightedTerms.push(ids[j]);
          } else {
            window.cy.$('[id="' + ids[j] + '"]').css({'border-width': 10, 'border-color': 'blue'});
            highlightedTerms.push(ids[j])
          }
          // Append a new button for every search term
          $("#search_terms").append('<li><a class="search"  id="' + ids[j]  + '" value="' + ids[j] + '">' + labels[j] + '</a></li>');
          $("#search").val("");
        }
      }
    }

    var linkToGraph = document.URL.substring(0, document.URL.indexOf('?'));
    var layout = getQueryVariable('layout');
    var search = getQueryVariable('search');
    var displayLink = false;
    if (layout) {
      linkToGraph += '?layout=' + layout;

      if (search) {
        linkToGraph += '&search=';
      }
    } else if (search) {
      linkToGraph += '?search=' + search;
    } else {
      linkToGraph += '?search=';
    }

    if (highlightedTerms.length > 0) {
      displayLink = true;
    } else {
      return alert("No elements match your search criteria!");
    }

    for (var z = 0; z < highlightedTerms.length; z++) {
      if (highlightedTerms[z].indexOf('-') > -1) {
        highlightedTerms[z] = highlightedTerms[z].replace('-', ':');
      }
      if (search) {
        linkToGraph += ',' + highlightedTerms[z];
      } else {
        if (z == highlightedTerms.length - 1) {
          linkToGraph += highlightedTerms[z];
        } else {
          linkToGraph += highlightedTerms[z] + ',';
        }
      }
    }

    if (displayLink) {
      $("#url").attr('href', linkToGraph);
      $("#url").text("Link to this graph with highighted elements");
      $(".test").css("height", $(".test").height + 30);
    }
  });
}

/**
 * Get all the highlighted terms in the graph.
 */
function getHighlightedTerms() {
  // Create a url with all the highlighted terms
  var highlightedTerms = new Array();
  var linkToGraph = ""
  // Go through all of the highlighted terms
  $(".search").each(function (index) {
    if (highlightedTerms.indexOf($(this).attr('id')) == -1) {
      highlightedTerms.push($(this).attr('id'));
    }
  });

  for (var i = 0; i < highlightedTerms.length; i++) {

    if (highlightedTerms[i].indexOf('-') > -1) {
      highlightedTerms[i] = highlightedTerms[i].replace('-', ':');
    }

    if (i == highlightedTerms.length - 1) {
      linkToGraph += highlightedTerms[i];
    } else {
      linkToGraph += highlightedTerms[i] + ',';
    }
  }

  return linkToGraph
}


// Gets the largest K value elements from the graph
// and only renders those values
function getLargestK(graph_json) {
  var edges = graph_json['edges'];

  var largestK = 0;
  for (var i = 0; i < edges.length; i++) {
    k_val = parseInt(edges[i]['data']['k']);
    if (k_val > largestK) {
      largestK = k_val;
    }
  }
  return largestK;
}

// Checks to see if color is Hex
function isHexaColor(sNum){
  return (typeof sNum === "string") && sNum.length === 7
         && ! isNaN( parseInt(sNum.substring(1), 16) ) && sNum.substring(0,1) == '#' ;
}

//Appends # character if string is hex
function addCharacterToHex(sNum) {
  if (sNum.length == 6 && ! isNaN( parseInt(sNum, 16) )) {
    return '#' + sNum;
  } else {
    return sNum
  }
}
//Small function to split terms based on the '_' character
function splitTerms(term) {
  return term.split("_");
}

//Gets query variables from the url
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

// Returns all the id's that are not <= k value
function showOnlyK() {
  var maxVal = parseInt($("#input_k").val());

  window.cy.elements().show();
  hideList = window.cy.filter('[k > ' + maxVal+ ']');
  hideList.hide();
}

//Gets all nodes and edges up do the max value set
//and only renders them
function applyMax(graph_layout) {
  var maxVal = parseInt($("#input_max").val());

  var newJSON = {
    "nodes": new Array(),
    "edges": new Array()
  };

  // List of node ids that should remain in the graph
  var nodeNames = Array();

  for (var i = 0; i < graph_json.graph['edges'].length; i++) {
    var edge_data = graph_json.graph['edges'][i];
    if (edge_data['data']['k'] <= maxVal) {
      newJSON['edges'].push(edge_data);
      nodeNames.push(edge_data['data']['source']);
      nodeNames.push(edge_data['data']['target']);
    }
  }

  for (var i = 0; i < graph_json.graph['nodes'].length; i++) {
    var node_data = graph_json.graph['nodes'][i];
    if (nodeNames.indexOf(node_data['data']['id']) > -1) {
      newJSON['nodes'].push(node_data);
    }
  }

  window.cy.load(newJSON);
}

//Unselects a specified term from graph
function unselectTerm(term) {
  window.cy.$('[id="' + term + '"]').removeCss();
  // window.cy.$('[id="' + term + '"]').unselect();
}

function getLayoutFromQuery() {

    //The following code retrieves the specified layout
    //of a graph to be displayed.
    //Some of them are pre-defined. Check Cytoscapejs.org
    var graph_layout = {
      name: 'arbor',
      padding: 10,
      fit:true
    };

    var query = getQueryVariable("layout");
    if (query == "default_breadthfirst") {
      graph_layout = {
        name: "breadthfirst",
        padding: 10,
        fit: true,
        avoidOverlap: true,
        animate: false
      }
    } else if (query == "default_concentric") {
       graph_layout = {
        name: "concentric",
        fit: true,
        padding: 10,
        avoidOverlap: true,
        animate: false
      }
    } else if (query == "default_circle") {
       graph_layout = {
        name: "circle",
        padding: 10,
        fit: true,
        avoidOverlap: true,
        animate: false
      }
    } else if (query == "default_dagre") {
       graph_layout = {
        name: "dagre",
        fit: true,
        padding: 10,
        animate: false,
        nodeSep: 50,
        edgeSep: 50
      }
    } else if (query == 'default_cose') {
      graph_layout = {
        name: "cose",
        padding: 10,
        fit: true,
        animate: false,
        nodeOverlap: 30
      }
    } else if (query == "default_cola") {
      graph_layout = {
        name: "cola",        
        fit: true,
        nodeSpacing: function( node ){ return 20; },
        padding: 10,
        animate: false,
        avoidOverlap: true
      }
    }  else if (query == "default_arbor") {
      graph_layout = {
        name: "arbor",
        padding: 30,
        fit: true,
        animate: true,
        repulsion: 4500,
        maxSimulationTime: 2000
      }
    }  else if (query == "default_springy") {
      graph_layout = {
        name: 'springy',

        animate: true, // whether to show the layout as it's running
        maxSimulationTime: 4000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: true, // whether to fit the viewport to the graph
        padding: 30, // padding on fit
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        random: false, // whether to use random initial positions
        infinite: false, // overrides all other options for a forces-all-the-time mode
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop

        // springy forces
        stiffness: 400,
        repulsion: 400,
        damping: 0.5
      }
    } else {
      if (layout != null) {
        graph_layout = {
          name: 'preset',
          positions: JSON.parse(layout.json)
        };
      }
    }

    return graph_layout;
}

/** 
* Returns the HEX value of a color
*/
function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (colour in Object.keys(colours)) {
      return colours[colour]
    }
    return false;
}

