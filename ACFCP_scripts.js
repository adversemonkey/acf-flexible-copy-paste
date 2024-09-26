(function($) {
    $(document).on("ready", function() {
        $(".acf-fc-layout-controls").each(function() {
            $(this).prepend('<a class="acf-icon -duplicate -copy ACFCP_copy small light acf-js-tooltip" href="#" data-name="copy-layout" title="Copia Layout"><svg version="1.1" viewBox="0 0 533.3 666.7" xmlns="http://www.w3.org/2000/svg"><path style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 66.7px;" d="m133.3 100c-32.9 0-50.2 0.4-63.6 7.3-12.5 6.4-22.7 16.6-29.1 29.1-7.3 14.3-7.3 32.9-7.3 70.3v320c0 37.3 0 56 7.3 70.3 6.4 12.5 16.6 22.7 29.1 29.1 14.3 7.3 32.9 7.3 70.3 7.3h253.3c37.3 0 56 0 70.3-7.3 12.5-6.4 22.7-16.6 29.1-29.1 7.3-14.3 7.3-32.9 7.3-70.3v-320c0-37.3 0-56-7.3-70.3-6.4-12.5-16.6-22.7-29.1-29.1-13.4-6.8-30.7-7.2-63.6-7.3m-266.7 0v66.7h266.7v-66.7m-266.7 0v-9.8c0-15.1 6-29.6 16.7-40.2s25.1-16.7 40.2-16.7h152.9c15.1 0 29.6 6 40.2 16.7s16.7 25.1 16.7 40.2v9.8m-133.3 200v200l-66.7-66.7m66.7 66.7 66.7-66.7"/></svg></a>');
        });

        setInterval(ACFCP_checkClipboard, 1000);
    });

    $.fn.closestDescendantSiblings = function(selector) {
        var closestDescendant = this.closestDescendant(selector);
        if (closestDescendant.siblings(selector).length) {
           return closestDescendant.add(closestDescendant.siblings(selector));
        }
        return closestDescendant;
     }; 
     $.fn.closestDescendant = function(sel) {
        var rva = [];
        this.each(function() {
            var base = this, $base = $(base), $found = $base.find(sel);
            var dist = null, closest = null;
            $found.each(function() {
                var $parents = $(this).parents();
                for (var i = 0; i < $parents.length; ++i) if ($parents.get(i) === base) break;
                if (dist === null || i < dist) {
                    dist = i;
                    closest = this;
                }
            });
            rva.push(closest);
        });
        var rv = $();
        for(var i = 0; i < rva.length; ++i) if (rva[i]) rv = rv.add(rva[i]);
        return rv;
      };

    // COPY

    $(document).on("click", ".acf-fc-layout-controls .acf-icon[data-name='copy-layout']", function(e) {
        ACFCP_copyLayout($(this).closest(".layout"));
    });

    function ACFCP_copyLayout(layout) {
        var flexibleName = layout.parents(".acf-field-flexible-content").eq(0).attr("data-name");
        var layoutName = layout.attr("data-layout");
       
        layoutContents = ACFCP_parseNode(layout);

        var toCopy = {
            type: "flexible_layout",
            name: flexibleName,
            layout: layoutName,
            contents: layoutContents,
            ACFFL_label: layout.find("input[name='ACFFL_label']").length ? layout.find("input[name='ACFFL_label']").eq(0).val() : null
        };

        var toCopyString = JSON.stringify(toCopy);

        localStorage.setItem('ACFCP', toCopyString);
        if (localStorage.getItem('ACFCP')) {
            alert("Copied!");
        }
    }

    function ACFCP_parseNode(node) {
        var nodeContents = {};

        var fields = node.find("> .acf-fields").length ? node.find("> .acf-fields > .acf-field") : node.find("> .acf-field");

        fields.each(function() {
            var type = $(this).attr("data-type");
            var name = $(this).attr("data-name");
    
            if (type == "group") {
                nodeContents[name] = ACFCP_parseNode($(this).find("> .acf-input"));
            } else if (type == "repeater") {
                nodeContents[name] = [];
                $(this).closestDescendantSiblings(".acf-row:not(.acf-clone)").each(function() {
                    nodeContents[name].push(ACFCP_parseNode($(this)));
                });
            } else if (type == "flexible_content") {
                nodeContents[name] = [];
                $(this).closestDescendantSiblings(".layout:not(.acf-clone)").each(function() {
                    nodeContents[name].push({
                        type: "flexible_layout",
                        name: name,
                        layout: $(this).attr("data-layout"),
                        contents: ACFCP_parseNode($(this))
                    });
                });
            } else {
                if ($(this).find("> .acf-input").length) {
                    ACFCP_fieldGetData(nodeContents, $(this));
                }
            }
        });

        for (var key in nodeContents) {
            if (nodeContents[key] === null || nodeContents[key] === undefined || (typeof nodeContents[key] === 'object' && Object.keys(nodeContents[key]).length === 0)) {
                delete nodeContents[key];
            }
        }
        
        return nodeContents;
    }

    function ACFCP_fieldGetData(ParentNodeContents, node) {
        var name = node.attr("data-name");
        var value = null;

        // TODO: relationship, post, radio, datepicker, timepicker

        if (node.attr("data-type") == "link") {
            value = {
                ACFCP_link: {
                    title: node.find("input.input-title").val(),
                    url: node.find("input.input-url").val(),
                    target: node.find("input.input-target").val()
                }
            };
        } else if (node.find(".acf-gallery").length) {
            // gallery
            value = {
                ACFCP_items: []
            };

            node.find(".acf-gallery .acf-gallery-attachment").each(function() {
                value.ACFCP_items.push({
                    id: $(this).attr("data-id"),
                    url: $(this).find(".thumbnail img").attr("src"),
                    type: $(this).attr("class").split(" ").filter(function(c) { return c[0] == '-'; })[0].replace("-", "")
                });
            });
        } else if (node.find("[class*='-uploader'][data-library]").length) {
            // file, image
            var nodeVariableDOM = node.find(".acf-input").clone();
            nodeVariableDOM.find("input[type='hidden']").remove();

            value = {
                id: node.find("[class*='-uploader'][data-library] > input").val(),
                ACFCP_html: nodeVariableDOM.html()
            };
        } else if (node.find(".tmce-active").length) {
            // editor (WYSIWYG)
            value = node.find(".wp-editor-area").val();
        } else if (node.find("select").length) {
            // select
            value = node.find("select").val();
        } else if (node.find("textarea").length) {
            // textarea
            value = node.find("textarea").val();
        } else if (node.find("input[type='checkbox']:checked").length) {
            // checkbox
            value = node.find("input[type='checkbox']:checked").val();
        } else if (node.find("input[type='text'], input[type='tel'], input[type='url'], input[type='password'], input[type='email']").length) {
            // text, tel, url, password, email
            value = node.find("input[type='text'], input[type='tel'], input[type='url'], input[type='password'], input[type='email']").eq(0).val();
        }

        if (value) {
            ParentNodeContents[name] = value;
        }
    }

    // PASTE

    window.ACFCP_lastPaste = null;
    function ACFCP_checkClipboard(recheck = false) {
        var toPasteString = localStorage.getItem('ACFCP');
        
        if (window.ACFCP_lastPaste != toPasteString || recheck) {
            $(".acf-fc-layout-controls .ACFCP_paste").remove();
            $(".acf-actions .acf-button[data-name='paste-layout']").remove();

            window.ACFCP_lastPaste = toPasteString;

            if (toPasteString) {
                var toPaste = JSON.parse(toPasteString);
                
                if (toPaste.type == "flexible_layout") {
                    var flexible_name = toPaste.name;
                    $(".acf-field-flexible-content[data-name='"+flexible_name+"']").each(function() {
                        $(this).closestDescendantSiblings(".layout:not(.acf-clone)").each(function() {
                            $(this).find("> .acf-fc-layout-controls").prepend('<a class="acf-icon -duplicate -paste ACFCP_paste small light acf-js-tooltip" href="#" data-name="paste-layout" title="Incolla Layout (prima)"><svg version="1.1" viewBox="0 0 533.33 666.67" xmlns="http://www.w3.org/2000/svg"><path style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 66.6666641px;" d="m133.33 100c-32.945 0.02567-50.214 0.44433-63.599 7.2647-12.544 6.3913-22.743 16.59-29.134 29.134-7.2663 14.261-7.2663 32.929-7.2663 70.266v320c0 37.337 0 56.007 7.2663 70.267 6.3913 12.543 16.59 22.743 29.134 29.133 14.261 7.2667 32.929 7.2667 70.266 7.2667h253.33c37.337 0 56.007 0 70.267-7.2667 12.543-6.39 22.743-16.59 29.133-29.133 7.2667-14.26 7.2667-32.93 7.2667-70.267v-320c0-37.337 0-56.005-7.2667-70.266-6.39-12.544-16.59-22.743-29.133-29.134-13.387-6.8203-30.653-7.239-63.6-7.2647m-266.67 0v66.665h266.67v-66.665m-266.67 0v-9.7647c0-15.092 5.9953-29.566 16.667-40.237s25.145-16.667 40.237-16.667h152.86c15.09 0 29.567 5.9953 40.237 16.667s16.667 25.145 16.667 40.237v9.7647m-133.33 400v-200m0 1e-7 66.667 66.667m-66.667-66.667-66.667 66.667"/></svg></a>');
                        });
                    });
                    $(".acf-field-flexible-content[data-name='"+flexible_name+"']").each(function() {
                        $(this).closestDescendant(".acf-actions").each(function() {
                            $(this).prepend('<a class="acf-button button button-secondary" href="#" data-name="paste-layout">Incolla</a>');
                        });
                    });
                }
            }
        }
    }

    $(document).on("click", ".acf-fc-layout-controls .acf-icon[data-name='paste-layout']", function(e) {
        var toPasteString = localStorage.getItem('ACFCP');
        var toPaste = JSON.parse(toPasteString);
        ACFCP_insertLayout($(this).parents(".acf-field-flexible-content").eq(0), toPaste, $(this).parents(".layout").eq(0).prevAll().length);
    });
    $(document).on("click", ".acf-actions .acf-button[data-name='paste-layout']", function(e) {
        var toPasteString = localStorage.getItem('ACFCP');
        var toPaste = JSON.parse(toPasteString);
        ACFCP_insertLayout($(this).parents(".acf-field-flexible-content").eq(0), toPaste);
    });

    function ACFCP_insertLayout(flexibleContentsFieldDOM, toPaste, index = null) {

        if (toPaste.type == "flexible_layout" && toPaste.name == flexibleContentsFieldDOM.attr("data-name")) {  
            flexibleContentsFieldDOM.closestDescendant(".acf-actions").find(".acf-button[data-name='add-layout']").trigger("click");
            $("body > .acf-tooltip").find("a[data-layout='"+toPaste.layout+"']").trigger("click");
            
            $(".acf-tooltip.acf-fc-popup").remove();
            $(".acf-actions").removeClass("-hover");
            $(document).trigger("click");

            ACFCP_checkClipboard(true);

            var newLayout = flexibleContentsFieldDOM.closestDescendantSiblings(".layout:not(.acf-clone)").eq(-1);
            if (index != null) {
                newLayout.insertBefore(flexibleContentsFieldDOM.closestDescendantSiblings(".layout:not(.acf-clone)").eq(index));
            }
            
            
            if (toPaste.ACFFL_label) {
                newLayout.find("input[name='ACFFL_label']").eq(0).val(toPaste.ACFFL_label+" (copy)");
                setTimeout(function() {
                    newLayout.find("input[name='ACFFL_label']").eq(0).val(toPaste.ACFFL_label+" (copy)");
                }, 500);
            }
                
            ACFCP_compileNode(newLayout, toPaste.contents);

            $(".acf-tooltip.acf-fc-popup").remove();
            $(".acf-actions").removeClass("-hover");
            
            setTimeout(function() {
                $(document).trigger("click");
            },100);
        }
    }

    function ACFCP_compileNode(node, contents) {
        var fieldsDOM = null;

        if (node.find("> .acf-input > .acf-fields").length) {
            fieldsDOM = node.find("> .acf-input > .acf-fields");
        } else if (node.find("> .acf-fields").length) {
            fieldsDOM = node.find("> .acf-fields");
        } else if (node.find("> .acf-field").length) {
            fieldsDOM = node;
        }
        if (fieldsDOM == null) {
            console.log(node, contents);
            return;
        }

        for (var key in contents) {
            if (typeof contents[key] === 'object' && contents[key].ACFCP_html == undefined && contents[key].ACFCP_items == undefined && contents[key].ACFCP_link == undefined) {
                if (Array.isArray(contents[key])) {
                    var fieldDOM = fieldsDOM.find("> .acf-field[data-name='"+key+"']");
                    if (fieldDOM.hasClass("acf-field-repeater")) {
                        for (var i = 0; i < contents[key].length; i++) {
                            fieldDOM.closestDescendant(".acf-actions").find("> .acf-repeater-add-row").trigger("click");
                            ACFCP_compileNode(fieldDOM.closestDescendantSiblings(".acf-row").eq(i), contents[key][i]);
                        }
                    } else if (fieldDOM.attr("data-type") == "flexible_content") {
                        for (var i = 0; i < contents[key].length; i++) {
                            ACFCP_insertLayout(fieldDOM, contents[key][i]);
                        };
                    }
                } else {
                    ACFCP_compileNode(fieldsDOM.find("> .acf-field[data-name='"+key+"']"), contents[key]);
                }
            } else {
                ACFCP_compileField(fieldsDOM.find("> .acf-field[data-name='"+key+"']"), contents[key]);
            }
        }
    }

    function ACFCP_compileField(node, value) {
        if (node.attr("data-type") == "link") {
            var acf_field = acf.getField(node);
            acf_field.setValue(value.ACFCP_link);
        } else if (node.attr("data-type") == "color_picker") {
            var acf_field = acf.getField(node);
            if (acf_field) {
                acf_field.setValue(value);
            }
        } else if (node.find(".acf-gallery").length) {
            var acf_field = acf.getField(node);
            if (acf_field) {
                for(var i = 0; i < value.ACFCP_items.length; i++) {
                    acf_field.appendAttachment(value.ACFCP_items[i]);
                }
            }
        } else if (node.find("[class*='-uploader'][data-library]").length) {
            var inputClone = node.find("input[type='hidden']").clone().val(value.id);

            node.find(".acf-input").html(value.ACFCP_html);
            node.find(".acf-input").prepend(inputClone);

        } else if (node.find(".tmce-active").length) {
            var editorId = node.find("textarea").attr("id");
            for(var i = 0; i < window.tinyMCE.editors.length; i++) {
                if (window.tinyMCE.editors[i].id == editorId) {
                    window.tinyMCE.editors[i].setContent(value);
                }
            }
        } else if (node.find("select").length) {
            node.find("select").val(value);
        } else if (node.find("textarea").length) {
            node.find("textarea").val(value);
        } else if (node.find("input[type='checkbox']").length) {
            node.find("input[type='checkbox'][value='"+value+"']").prop("checked", true);
        } else if (node.find("input[type='text'], input[type='tel'], input[type='url'], input[type='password'], input[type='email']").length) {
            node.find("input[type='text'], input[type='tel'], input[type='url'], input[type='password'], input[type='email']").val(value);
        }

        node.find("select, textarea, input").trigger("change");
    }
})(jQuery);