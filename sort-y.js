/*document.getElementById("circle-of-fifths-sort").onclick = function(event) { //Sort by circle of fifths
    sortYAxis(d3.ascending);
    sortYAxisCustom(circle_of_fifths)   
}
document.getElementById("c-major-sort").onclick = function(event) { //Chromatic sort
    sortYAxisCustom(c_major) 
}*/

document.getElementById("ascending").onclick = function(event) { //ASCENDING SORT SORT
    sortYAxis(d3.ascending);
}

document.getElementById("descending").onclick = function(event) { // DESCENDING SORT
    sortYAxis(d3.descending);
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
    bar_height = slider_value;
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
    .attr("y", d => get_note_y(d)+bar_height/4);

    sheet.selectAll(".harmonic-relation")
    .transition().duration(500)
    .attr("y", (d, j) => {
            return  get_note_y(d);
    });

    sheet_info.selectAll(".pitch-class").transition().duration(500)
    .attr("height", bar_height)
    .attr("y", (d, i) => sheet_height-(i+1)*bar_height);

    sheet_info.selectAll(".y-label").transition().duration(500)
    .attr("height", bar_height)
    .attr("y", (d, i) => sheet_height-(i)*bar_height);


}

function adjustMeasureRange(transition_duration){
    var slider_value = document.getElementById("measure-slider").value;
    var new_scale_of_measure = scale_of_measure*slider_value;

    var sheet_width = data_part.measure.length*new_scale_of_measure;
    sheet.style("width", sheet_width+"px");

    sheet.selectAll(".note")
    .transition().duration(transition_duration)
    .attr("x", d => (d['@default-x']*slider_value))
    .attr("width", d => ((scale_of_measure/16)*parseInt(d["duration"])*slider_value)-beat_offset);

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
    .attr("width", d => ((scale_of_measure/16)*parseInt(d["duration"])*slider_value)-beat_offset);
    
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

function sortYAxis(sorting_function, sorting_pattern) { // DESCENDING SORT
    sheet_info.selectAll("text")
        .sort((a,b) => sorting_function(a.name, b.name,  sorting_pattern))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-i*bar_height-6);
    sheet_info.selectAll("rect")
        .sort((a,b) => sorting_function(a.name, b.name,  sorting_pattern))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-i*bar_height-bar_height);
    sheet.selectAll("rect")
        .sort((a,b) => sorting_function(a.name, b.name,  sorting_pattern))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-i*bar_height-bar_height);

    sheet.selectAll("circle")
        .transition().duration(500)
        .attr("cy", (d) => {
           if (!d.pitch) { cy = 0} else {
            pitch_classes = pitch_classes.sort((a,b) => sorting_function(a.name, b.name, sorting_pattern));
            var pitch = pitch_classes.find(pc => pc.name === d.pitch.step);
            var pitch_index = pitch_classes.indexOf(pitch);
            cy = pitch_index;
           }
           return sheet_height-cy*bar_height-bar_height/2;
        })

    sheet.selectAll("path")
        .transition().duration(500)
        .attr("d", (d, i) => {  
            var start_x = d["@default-x"];
            var end_x = start_x+(scale_of_measure/16)*parseInt(d["duration"])-(beat_offset*2);
            var cy;
            if (!d.pitch) { cy = 0} else { 
                var pitch = pitch_classes.find(pc => pc.name === d.pitch.step);
                var pitch_index = pitch_classes.indexOf(pitch);
                cy = pitch_index;
                cy = sheet_height-cy*bar_height-bar_height/2
            }
            var path_d = "M "+ start_x+" "+cy+" L "+end_x+" "+cy;
            return path_d;
        });
}

function sortYAxisCustom(sorting_pattern) { //Chromatic sort
    sheet_info.selectAll("text")
        .sort((a, b) => SortByArray(a, b, sorting_pattern))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-i*bar_height-6);
    sheet_info.selectAll("rect")
        .sort((a, b) => SortByArray(a, b, sorting_pattern))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-i*bar_height-bar_height);
    sheet.selectAll("rect")
        .sort((a, b) => SortByArray(a, b, sorting_pattern))
        .transition().duration(500)
        .attr("y", (d, i) => sheet_height-i*bar_height-bar_height);

    sheet.selectAll("circle")
        .transition().duration(500)
        .attr("cy", (d) => {
           if (!d.pitch) { cy = 0} else {
            pitch_classes = pitch_classes.sort((a, b) => SortByArray(a, b, sorting_pattern))
            var pitch = pitch_classes.find(pc => pc.name === d.pitch.step && pc.octave == d.pitch.octave);
            var pitch_index = pitch_classes.indexOf(pitch);
            cy = pitch_index;
           }
           return sheet_height-cy*bar_height-bar_height/2;
        })
    
    var aggr_durations = 0;
    sheet.selectAll("path")
        .transition().duration(500)
        .attr("d", (d, i) => {  
            var start_x = aggr_durations;
            aggr_durations += d["duration"]*scale_of_measure;
            var end_x = aggr_durations;

            var cy;
            if (!d.pitch) { cy = 0} else { 
                var pitch = pitch_classes.find(pc => pc.name === d.pitch.step && pc.octave == d.pitch.octave);
                var pitch_index = pitch_classes.indexOf(pitch);
                cy = pitch_index;
                cy = sheet_height-cy*bar_height-bar_height/2
            }
            var path_d = "M "+ start_x+" "+cy+" L "+end_x+" "+cy;
            return path_d;
        });
}

function SortByArray(x, y, sorting_pattern) {
            var x_pitch = x.name;
            var x_octave = x.octave;
            var y_pitch = y.name;
            var y_octave = y.octave;
            var x_index, y_index;
            for (i = 0; i < sorting_pattern.length; i++) {
                if(sorting_pattern[i] == x_pitch){
                    x_index = i;
                }
                if(sorting_pattern[i] == y_pitch){
                    y_index = i;
                }
            }
            if (x_index >= y_index) {
                return 1;
            } else if (x_index-1 < y_index){
                return -1;
            }
            return 0;
 }