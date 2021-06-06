function drawStaffs(){
    sheet.selectAll("rect.staffs")
    .data(pitch_classes)
    .enter()
    .append("rect")
    .attr("class", "staff")
    .attr("height", bar_height)
    .attr("width", "100%")
    .attr("y", (d, i) => getStaffOrLabelHeight(i))
    .style("fill", "none")
    .attr("shape-rendering", "crispEdges")
    .style("stroke", "rgba(0,0,0,0.1)")
    .style("stroke-width", "0.5");
}

function drawYLabels(){
    sheet_info.selectAll(".info")
    .data(pitch_classes)
    .enter()
    .append("rect")
    .attr("class", "pitch-class")
    .attr("height", bar_height)
    .attr("width", "100%")
    .attr("y", (d, i) => getStaffOrLabelHeight(i))
    .attr("id", d => d.name)
    .style("fill", "rgb(225,225,230)")
    .style("stroke", "rgba(0,0,0,0.1)")
    .style("stroke-width", "1")

    sheet_info.selectAll("text.y-labels")
    .data(pitch_classes)
    .enter()
    .append("text")
    .attr("class", "y-label")
    .attr("x", 8 )
    .attr("y", (d, j) => sheet_height-j*bar_height-(bar_height/6))
    .attr("font-size", "9px")
    .attr("font-family", "Arial")
    .text(d => {
        var d_octave = parseInt(lowest_octave)+parseInt(d.oct_index);
        return d.name + " " +d_octave;
    });
}

function drawMeasures() {
    sheet.selectAll("line.measure")
        .data(data_part.measure)
        .enter()
        .append("line")
        .attr("class", "measure")
        .attr("x1", d => parseInt(d["@number"])*scale_of_measure)
        .attr("y1", () => offset_top)
        .attr("x2", d => parseInt(d["@number"])*scale_of_measure)
        .attr("y2", () => sheet_height)
        .attr("shape-rendering", "crispEdges")
        .style("stroke", "black")
        .style("stroke-width", "0.5");
}

function drawBeats(s) {
    var segments = s; 
    var sum_of_measures = data_part.measure.length;

    sheet.selectAll("line.beat").attr("class", "beat").remove();
    for (i = 0; i < segments; i++) {
        sheet.selectAll("line.beats")
        .data(data_part.measure)
        .enter()
        .append("line")
        .attr("class", "beat")  
        .attr("x1", (d, j) => { 
            var length = (scale_of_measure)/segments;
            return (j+(i*sum_of_measures))*length;
        })
        .attr("y1", d => offset_top)
        .attr("x2", (d, j) => {
            var length = (scale_of_measure)/segments;
            return (j+(i*sum_of_measures))*length;
        })
        .attr("y2", d => sheet_height)
        .attr("shape-rendering", "crispEdges")
        .style("stroke", "rgba(0,0,0,0.1)")
        .style("stroke-width", 0.5);
    }
}

function drawChordLabels(){;
    sheet.selectAll("text")
    .data(data_part.measure)
    .enter()
    .append("text")
    .attr("class", "harmony") 
    .attr("x", (d, i) => (i-1)*scale_of_measure)
    .attr("y", 20)
    .attr("font-size", "14px")
    .attr("font-family", "Arial")
    .text(d => {
        if (d['harmony']) {
            if(d['harmony']['function']) {
                return d['harmony']['function'];
            } else if (Array.isArray(d['harmony'])) {
                var text = ""; 
                for (i = 0; i < d['harmony'].length; i++) {
                    text += d['harmony'][i]['function']+" ";
                }
                return text;
            }
        } else {
            return "";
        }
    });

}

function drawNotes(){
    sheet.selectAll(".rect")
    .data(notes)
    .enter()
    .append("rect")
    .attr("class", "note")
    .attr("height", bar_height)
    .attr("width",  (d, i) => {
        if(!d['grace']) {
            return (beat_units)*parseInt(d["duration"]);
        } else {
            return 0;
        }
    }) 
    .attr("x", d => d['@default-x'])
    .attr("y", d => get_note_y(d))
    .style("fill", d => get_note_color(d))
    .style("stroke",  d => get_note_color(d))
    .style("stroke-width", "1")
    .style("rx", 2)
    .on("mouseover", function(d) {  
      d3.select(this).transition().duration('50')
        .style('fill', 'rgba(20, 20, 100, 0.2)');
        
        sheet.select("rect.tooltip")
        .style("opacity", "0.8")
        .attr("x", (parseInt(d['@default-x'])*slider_value)+20)
        .attr("y", get_note_y(d)+10)

        sheet.select("text.tooltip-text").style("opacity", "1")
        .attr("x", (parseInt(d['@default-x'])*slider_value)+30)
        .attr("y", get_note_y(d)+20)
        .text("Note: "+d.pitch.step+d.pitch.octave);
    })
    .on("mouseleave", function() {  
      d3.select(this).transition().duration('50')
        .style('fill', d => get_note_color(d))

        sheet.select("rect.tooltip").style("opacity", "0")
        sheet.select("text.tooltip-text").style("opacity", "0")
    })
}

function drawTonality(){
    var key_of_piece = document.getElementById("key-of-piece");
    key_of_piece.innerHTML = key;
    var mode_of_piece = document.getElementById("mode-of-piece");
    var mode = document.getElementById("modulate").value;
    mode = mode.split("_")[0] 
    mode_of_piece.innerHTML = mode;
}

function drawTonalRelations(){
    sheet.selectAll(".harmonic-relations")
        .data(notes)
        .enter()
        .append("rect")
        .attr("class", "harmonic-relation")
        .attr("opacity", "0")
        .attr("x", d => d["@default-x"]*slider_value)
        .attr("y", (d, i) => getIntervalY(d, i))
        .attr("height", (d, i) => getIntervalHeight(d, i))
        .attr("width", d => getIntervalWidth(d))
        .attr("fill", (d, i) => getIntervalFill(d, i))
        .transition().duration(500).style("opacity", "1");
}

function getIntervalY(d, i){
    if(notes[i-1] != undefined){
        if(d['@default-x'] == notes[i-1]["@default-x"]) {
            return d["@default-y"]+bar_height;
        } else {
            return 0;
        }
    }
}

function getIntervalHeight(d, i){
    if(notes[i-1] != undefined){
        if(d['@default-x'] == notes[i-1]["@default-x"] && notes[i-1]["@default-y"]-d["@default-y"] > 0) {
            return notes[i-1]["@default-y"]-d["@default-y"]-bar_height;
        }
    } else {
        return 0;
    }
}

function getIntervalWidth(d){
    return (d["@default-dx"]-d["@default-x"])*slider_value;
}

function getIntervalFill(d, i){
    if(notes[i-1] != undefined){
        if(d['@default-x'] == notes[i-1]["@default-x"]){
            var interval = immutable_pitch_classes.indexOf(d.pitch.step) - immutable_pitch_classes.indexOf(notes[i-1].pitch.step)
            if (interval < 0) { interval = 12+interval }

            if (only_con_dis == false && only_min_maj == false) {
                if (interval == 0 || interval == 12 || interval == 7 || interval == 5) { //Perfect: p1 p8 p5 p4
                    return "rgba(220, 220, 220, 0.4)";            
                } else if(interval == 3 || interval == 8){ //Imperfect minor
                    return "rgb(	255, 203, 0,0.4)"; 
                } else if(interval == 4 || interval == 9) { //Imperfect: M3 M6
                    return "rgba(5, 143, 255, 0.4)";
                } else if(interval == 6) {//dissonant
                    return "rgba(204, 51, 17,0.4)"; 
                } else if(interval == 1 || interval == 10){ //dissonant m1, m7
                    return "rgba(204, 51, 17,0.4)";
                } else if ( interval == 2 ||  interval == 11 ){ //dissonant M1, M7
                    return "rgba(204, 51, 17,0.4)"; 
                }
            } else if (only_con_dis == true && only_min_maj == false) {
                if (interval == 0 || interval == 12 || interval == 7 || interval == 5 || interval == 3 || interval == 8 || interval == 4 || interval == 9) {
                    return "rgba(220, 220, 220, 0.4)";  
                } else if (interval == 6 || interval == 1 || interval == 10 || interval == 2 || interval == 11) {
                    return "rgba(204, 51, 17,0.4)"; 
                }
            } else if (only_min_maj == true && only_con_dis == false) {
                if (interval == 4 || interval == 9 || interval == 2 ||  interval == 11) {
                    return "rgba(5, 143, 255, 0.4)";
                } else if (interval == 3 || interval == 8 || interval == 1 || interval == 10) {
                    return "rgb(255, 203, 0,0.4)"; 
                } else if (interval == 0 || interval == 12 || interval == 7 || interval == 5 || interval == 6) {
                    return "rgba(220, 220, 220, 0)"; 
                }
            } else {
                return 0;
            }
        }
    }
}