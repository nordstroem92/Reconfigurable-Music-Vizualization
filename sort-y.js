/*document.getElementById("circle-of-fifths-sort").onclick = function(event) { //Sort by circle of fifths
    sortYAxis(d3.ascending);
    sortYAxisCustom(circle_of_fifths)   
}
document.getElementById("c-major-sort").onclick = function(event) { //Chromatic sort
    sortYAxisCustom(c_major) 
}
document.getElementById("ascending").onclick = function(event) { //ASCENDING SORT SORT
    sortYAxis(d3.ascending);
}
document.getElementById("descending").onclick = function(event) { // DESCENDING SORT
    sortYAxis(d3.descending);
}*/

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
            aggr_durations += d["duration"]*measure_scale;
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
            aggr_durations += d["duration"]*measure_scale;
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
            if (x_octave >= y_octave) {
                if (x_index >= y_index) {
                    return 1;
                } else if (x_index-1 < y_index){
                    return -1;
                }
            } else {
                return -1;
            }
            return 0;
 }