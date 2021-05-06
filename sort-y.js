document.getElementById("circle-of-fifths-sort").onclick = function(event) { //Sort by circle of fifths
    sortYAxis_custom(circle_of_fifths_sort); 
}

document.getElementById("scale-degrees-only").onclick = function(event) { //Sort by circle of fifths
    scaleDegreesOnly(); 
}

document.getElementById("voicing").onchange = function() { //Sort by circle of fifths
    var e = document.getElementById("voicing");
    var value = e.options[e.selectedIndex].value;
    updateView(value);
}

document.getElementById("toggleTonalRelations").onclick = function() { //Sort by circle of fifths
    toggleTonalRelations(); 
}

document.getElementById("c-major-sort").onclick = function(event) { //Chromatic sort
    sortYAxis_custom(c_major_sort) 
}

document.getElementById("measure-slider").onchange = function(event) { // DESCENDING SORT
    adjustMeasureRange(500);
}

document.getElementById("beat-unit-slider").onchange = function(event) { // DESCENDING SORT
    adjustBeatUnits();
}

document.getElementById("bar-height-slider").onchange = function(event) { // DESCENDING SORT
    adjustBarHeight();
}

function adjustBeatUnits(){
    var slider_value = document.getElementById("beat-unit-slider").value;
    drawBeats(slider_value);
    adjustMeasureRange(0);
}


function adjustBarHeight(){
    var slider_value = document.getElementById("bar-height-slider").value;
    bar_height = parseInt(slider_value);
    sheet_height = offset_top+octave_span*12*bar_height;

    sheet.transition().duration(500).style("height", sheet_height+"px");
    d3.select("#sheet-info-container").transition().duration(500).style("height",  sheet_height+"px");
    d3.select("#container").transition().duration(500).style("height",  sheet_height+"px");
    sheet.selectAll("rect.staff").transition().duration(500)
    .attr("height", bar_height)
    .attr("y", (d, i) => sheet_height-(i+1)*bar_height);

    sheet.selectAll(".measure").transition().duration(500)
    .attr("y2", d => sheet_height)

    sheet.selectAll(".beat").transition().duration(500)
    .attr("y2", d => sheet_height)

    sheet.selectAll(".note").transition().duration(500)
    .attr("height", d=> bar_height)
    .attr("y", d => {
        d["@default-y"] = get_note_y(d);
        return d["@default-y"]
    });

    sheet.selectAll(".harmonic-relation")
    .transition().duration(500)
    .attr("y", (d, i) => {
        return  notes[i]["@default-y"]+bar_height;
    }).attr("height", (d, i) => {
        if(d['chord']){
            return notes[i-1]["@default-y"]-notes[i]["@default-y"]-bar_height;
        } else {
            return 0; 
        }
    });

    sheet_info.selectAll(".pitch-class").transition().duration(500)
    .attr("height", bar_height)
    .attr("y", (d, i) => sheet_height-(i+1)*bar_height);

    sheet_info.selectAll(".y-label").transition().duration(500)
    .attr("height", bar_height)
    .attr("y", (d, i) => sheet_height-(i)*bar_height);
}

function scaleDegreesOnly(){
    sheet_height = offset_top+scale_degrees_only.length*bar_height;
    console.log(sheet_height);

    sheet.transition().duration(500).style("height", sheet_height+"px");
    d3.select("#sheet-info-container").transition().duration(500).style("height",  sheet_height+"px");
    d3.select("#container").transition().duration(500).style("height",  sheet_height+"px");

    var y_labels_before = sheet_info.selectAll(".y-label");
    var pitch_classes_before = sheet_info.selectAll(".pitch-class");
    var y_labels_before = sheet.selectAll(".staff");

    sheet_info.selectAll(".y-label").attr("opacity", 0);
    sheet_info.selectAll(".y-label")
    .filter(d => {
        for(var j = 0; j < scale_degrees_only.length; j++) {
            if (scale_degrees_only[j].name == d.name) {
                return d.name;
            }
        }
    })
    .attr("opacity", 1)
    .transition().duration(500)
    .attr("y", (d, i) => sheet_height-i*bar_height);

    sheet_info.selectAll(".pitch-class").attr("opacity", 0);
    sheet_info.selectAll(".pitch-class")
    .filter(d => {
        for(var j = 0; j < scale_degrees_only.length; j++) {
            if (scale_degrees_only[j].name == d.name) {
                return d.name;
            }
        }
    })
    .attr("opacity", 1)
    .transition().duration(500)
    .attr("y", (d, i) => sheet_height-(i+1)*bar_height);

    sheet.selectAll(".staff").attr("opacity", 0);
    sheet.selectAll(".staff")
    .filter(d => {
        for(var j = 0; j < scale_degrees_only.length; j++) {
            if (scale_degrees_only[j].name == d.name) {
                return d.name;
            }
        }
    })
    .attr("opacity", 1)
    .transition().duration(500)
    .attr("y", (d, i) => sheet_height-(i+1)*bar_height);

    sheet.selectAll(".note").style("opacity", 0);
    sheet.selectAll(".note")
    .filter(d => {
        for(var j = 0; j < scale_degrees_only.length; j++) {
            if (scale_degrees_only[j].name == d.pitch.step) {
                return d.pitch.step;
            }
        }
    })
    .style("opacity", 1)
    .transition().duration(500)
    .attr("y", (d) => {
        if (!d.pitch) { 
            return 0;
        } else {
            var d_relative_oct = parseInt(d.pitch.octave) - lowest_octave+1; //this is probably a stupid solution
            var pitch_name = scale_degrees_only.find(pc => pc.name == d.pitch.step && pc.oct_index == d_relative_oct);
            var pitch_index = scale_degrees_only.indexOf(pitch_name)+1;
            d["@default-y"] = sheet_height-pitch_index*bar_height;
            return d["@default-y"];
        }
    });

    sheet.selectAll(".harmonic-relation").style("opacity", 0);
}

function adjustMeasureRange(transition_duration){
    slider_value = document.getElementById("measure-slider").value;
    var new_scale_of_measure = scale_of_measure*slider_value;

    var sheet_width = data_part.measure.length*new_scale_of_measure;
    sheet.style("width", sheet_width+"px");

    sheet.selectAll(".note")
    .transition().duration(transition_duration)
    .attr("x", d => (d['@default-x']*slider_value))
    .attr("width", d => ((scale_of_measure/16)*parseInt(d["duration"])*slider_value));

    sheet.selectAll(".measure")
    .transition().duration(transition_duration)
    .attr("x1", d => parseInt(d["@number"])*new_scale_of_measure)
    .attr("x2", d => parseInt(d["@number"])*new_scale_of_measure);

    sheet.selectAll(".harmony")
    .transition().duration(transition_duration)
    .attr("x", (d , i) => (i-1)*new_scale_of_measure);

    sheet.selectAll(".harmonic-relation")
    .transition().duration(transition_duration)
    .attr("x", d => d['@default-x']*slider_value)
    .attr("width", d => ((scale_of_measure/16)*parseInt(d["duration"])*slider_value));
    
    var segments = document.getElementById("beat-unit-slider").value;
    d3.selectAll(".beat")
    .transition().duration(transition_duration)
    .attr("x1", (d, j) => {
        var length = (new_scale_of_measure)/segments;
        return j*length;
    })
    .attr("x2", (d, j) => {
        var length = (new_scale_of_measure)/segments;
        return j*length;
    });
}

function sortYAxis_custom(sorting_pattern) { 
    sheet_info.selectAll(".y-label")
        .sort((a,b) => sorting_pattern(a, b))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-i*bar_height);

    sheet_info.selectAll(".pitch-class")
        .sort((a,b) => sorting_pattern(a, b))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-(i+1)*bar_height);
    
    sheet.selectAll(".staff")
        .sort((a,b) => sorting_pattern(a, b))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-(i+1)*bar_height);

    pitch_classes.sort((a,b) => sorting_pattern(a, b))
    
    sheet.selectAll(".note")
        .transition().duration(500)
        .attr("y", (d) => {
            if (!d.pitch) { 
                return 0;
            } else {
                var d_relative_oct = parseInt(d.pitch.octave) - lowest_octave+1; //this is probably a stupid solution
                var pitch_name = pitch_classes.find(pc => pc.name == d.pitch.step && pc.oct_index == d_relative_oct);
                var pitch_index = pitch_classes.indexOf(pitch_name)+1;
                d["@default-y"] = sheet_height-pitch_index*bar_height;
                return d["@default-y"];
            }
    });
    
    sheet.selectAll(".harmonic-relation")
        .transition().duration(500)
        .attr("y", (d, i) => {
            return  notes[i]["@default-y"]+bar_height;
        }).attr("height", (d, i) => {
            if(d['chord']){
                if(notes[i-1]["@default-y"] > notes[i]["@default-y"]) {
                    return notes[i-1]["@default-y"]-notes[i]["@default-y"]-bar_height;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        }).attr("fill", (d, i) => {
            if(d['chord']){
                return getInterval(notes[i].pitch, notes[i-1].pitch);
            } else {
                return 0;
            } 
        });
}

function getInterval(a, b){
    var interval = immutable_pitch_classes.indexOf(a.step) - immutable_pitch_classes.indexOf(b.step)
    if (interval < 0) { interval = 12+interval }
    if (interval == 0 || interval == 12 || interval == 7 || interval == 5) { //Perfect: p1 p8 p5 p4
        return "rgba(0,0,255,0.4)";
    } else if (interval == 3 || interval == 4 || interval == 8 || interval == 9) { //Imperfect: M3 m3 M6 m6
        return "rgba(255,0,255,0.4)";
    } else if (interval == 1 || interval == 2 || interval == 10 || interval == 11 || interval == 6) { //Dissonant: M2 m2 M7 m7 d5 A4
        return "rgba(255,0,0,0.5)"; 
    }
}

function circle_of_fifths_sort(a ,b){
    var obj_a = circle_of_fifths.find(cof => cof.name == a.name && cof.oct_index == a.oct_index);
    var obj_b = circle_of_fifths.find(cof => cof.name == b.name && cof.oct_index == b.oct_index);
    if (circle_of_fifths.indexOf(obj_a) < circle_of_fifths.indexOf(obj_b)){
        return -1; 
    } else {
        return 1;
    }
}

function c_major_sort(a ,b){
    var obj_a = c_major.find(major => major.name == a.name && major.oct_index == a.oct_index);
    var obj_b = c_major.find(major => major.name == b.name && major.oct_index == b.oct_index);
    if (c_major.indexOf(obj_a) < c_major.indexOf(obj_b)){
        return -1; 
    } else {
        return 1;
    }
}