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
    .style("stroke", "rgba(0,0,0,0.5)")
    .style("stroke-width", "0.1");
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
    .style("fill", "none")
    .style("stroke", "rgba(0,0,0,0.5)")
    .style("stroke-width", "1")

    sheet_info.selectAll("text.y-labels")
    .data(pitch_classes)
    .enter()
    .append("text")
    .attr("class", "y-label")
    .attr("x", 8 )
    .attr("y", (d, j) => sheet_height-j*bar_height)
    .attr("font-size", "10px")
    .attr("font-family", "Arial")
    .text(d => {
        var d_octave = parseInt(lowest_octave)+parseInt(d.oct_index-1);
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
        .style("stroke", "black")
        .style("stroke-width", 1);
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
        .style("stroke", "rgba(100,100,100, 0.3)")
        .style("stroke-width", 1);
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

function drawTonalRelations(){
    sheet.selectAll(".harmonic-relations")
        .data(notes)
        .enter()
        .append("rect")
        .attr("class", "harmonic-relation")
        .attr("x", d => d["@default-x"])
        .attr("y", d => getIntervalY(d))
        .attr("height", (d, i) => getIntervalHeight(d, i))
        .attr("width", d => getIntervalWidth(d))
        .attr("fill", (d, i) => getIntervalFill(d, i));
}

function drawTonality(){
    var key_of_piece = document.getElementById("key-of-piece");
    key_of_piece.innerHTML = key;
    var mode_of_piece = document.getElementById("mode-of-piece");
    var mode = document.getElementById("modulate").value;
    mode = mode.split("_")[0] 
    mode_of_piece.innerHTML = mode;
}
