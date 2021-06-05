
document.getElementById("toggleAggregateNotes").onclick = function() { //Sort by circle of fifths
    toggleAggregateNotes(); 
}

document.getElementById("toggleAggregateNotesOneOctave").onclick = function() { //Sort by circle of fifths
    toggleAggregateNotesOneOctave(); 
}

document.getElementById("toggleAggregateIntervals").onclick = function() { //Sort by circle of fifths
    toggleAggregateIntervals(); 
}

function toggleAggregateIntervals() {
    var check = document.getElementById("toggleAggregateIntervals");
    if(check.checked) {
        intervalLineChart();
    } else {
        revertIntervalLineChart();
    }
}

function revertIntervalLineChart() {
    sheet.selectAll(".note").transition().duration(500).attr("opacity", 1)
    sheet.selectAll(".staff").transition().duration(500).attr("opacity", 1)
    sheet.selectAll(".harmony").transition().duration(500).attr("opacity", 1)
    sheet_info.selectAll("rect").transition().duration(500).attr("opacity", 1)
    sheet_info.selectAll("text").transition().duration(500).attr("opacity", 1)
    sheet_info.selectAll(".interval-name").remove();

    sheet.selectAll(".harmonic-relation")
    .transition().duration(500)
    .attr("x", d => d['@default-x']*slider_value)
    .attr("y", (d, i) => {
        return  notes[i]["@default-y"]+bar_height;
    }).attr("height", (d, i) => {
        if(d['chord']){
            return notes[i-1]["@default-y"]-notes[i]["@default-y"]-bar_height;
        } else {
            return 0; 
        }
    });
}

function intervalLineChart() {
    sheet.selectAll(".note").transition().duration(500).attr("opacity", 0)
    sheet.selectAll(".staff").transition().duration(500).attr("opacity", 0)
    sheet.selectAll(".harmony").transition().duration(500).attr("opacity", 0)
    sheet_info.selectAll("rect").transition().duration(500).attr("opacity", 0)
    sheet_info.selectAll("text").transition().duration(500).attr("opacity", 0)

    var default_bar_height = 15;

    sheet.transition().duration(500).style("height", 12*2*default_bar_height+"px");
    d3.select("#sheet-info-container").transition().duration(500).style("height",  12*2*default_bar_height+"px");
    d3.select("#container").transition().duration(500).style("height",  12*2*default_bar_height+"px");

    for (i = 0; i < interval_classes.length; i++){
        interval_classes[i].sum_x = 0;
    }

    sheet.selectAll(".harmonic-relation").transition().duration(500)
    .attr("x", (d, i) => {
        if(d['chord']) {
            var interval = immutable_pitch_classes.indexOf(notes[i-1].pitch.step)-immutable_pitch_classes.indexOf(d.pitch.step);
            if(interval < 0) {
                interval = 12 + interval;
            }
            var x = interval_classes[interval].sum_x
            interval_classes[interval].sum_x += (beat_units)*parseInt(d["duration"])*slider_value;
            return x;
        } else {
            return 0;
        }
    })
    .attr("height", d => {
        if(d['chord']) { 
            return default_bar_height;  
        } else {
            return 0;
        }
    })
    .attr("y", (d, i) => {
        if(d['chord']) {       
            var interval = immutable_pitch_classes.indexOf(notes[i-1].pitch.step)-immutable_pitch_classes.indexOf(d.pitch.step);
            if(interval < 0) {
                interval = 12 + interval;
            }
            return (interval*2*default_bar_height)+default_bar_height;
        } else {
            return -10;
        }
    });

    sheet_info.selectAll("interval-names")
    .data(interval_classes)
    .enter()
    .append("text")
    .attr("class", "interval-name") 
    .text((d) => d.interval_name)
    .attr("y", (d, i) => {
        return sheet_height - (i+1)*2*default_bar_height;
    });
}

function toggleAggregateNotes() {
    var aggr_check = document.getElementById("toggleAggregateNotes");
    var aggr_octave_check = document.getElementById("toggleAggregateNotesOneOctave");
    if(aggr_check.checked) {
        makeLineChart();
        aggr_octave_check.checked = false;
    } else {
        restoreLayout();
    }
}

function toggleAggregateNotesOneOctave() {
    var aggr_check = document.getElementById("toggleAggregateNotes");
    var aggr_octave_check = document.getElementById("toggleAggregateNotesOneOctave");
    if(aggr_octave_check.checked) {
        makeLineChartOneOctave();
        aggr_check.checked = false;
    } else {
        restoreLayout();
    }
}

function makeLineChart() {
    sheet.selectAll(".harmonic-relation").transition().duration(500).style("opacity", "0");
    for (i = 0; i < pitch_classes.length; i++){
        pitch_classes[i].sum_x = 0;
    }
    sheet.selectAll(".note")
    .transition().duration(500)
    .attr("x", d => {  
        var d_relative_oct = parseInt(d.pitch.octave) - lowest_octave; //this is probably a stupid solution
        var pitch_name = pitch_classes.find(pc => pc.name == d.pitch.step && pc.oct_index == d_relative_oct);
        var pitch_index = pitch_classes.indexOf(pitch_name);
        x = pitch_classes[pitch_index].sum_x;
        pitch_classes[pitch_index].sum_x += (beat_units)*parseInt(d["duration"])*slider_value;
        return x;
    })
    .attr("y", d =>  get_note_y(d))
    .attr("width", d => scale_of_measure/16*parseInt(d["duration"])*slider_value);
}
function makeLineChartOneOctave() {
    sheet.selectAll(".harmonic-relation").transition().duration(500).style("opacity", "0");
    
    for (i = 0; i < pitch_classes.length; i++){
        pitch_classes[i].sum_x = 0;
    }
    sheet.selectAll(".note")
    .transition().duration(500)
    .attr("x", d => {  
        var pitch_name = pitch_classes.find(pc => pc.name == d.pitch.step);
        var pitch_index = pitch_classes.indexOf(pitch_name);
        x = pitch_classes[pitch_index].sum_x;
        pitch_classes[pitch_index].sum_x += (beat_units)*parseInt(d["duration"])*slider_value;
        return x;
    })
    .attr("y", d => {  
        var pitch_name = pitch_classes.find(pc => pc.name == d.pitch.step);
        var pitch_index = pitch_classes.indexOf(pitch_name);
        return sheet_height-(pitch_index+1)*bar_height;
    })
    .attr("width", d => scale_of_measure/16*parseInt(d["duration"])*slider_value);
}

function restoreLayout() {
    sheet.selectAll(".note").transition().duration(500)
    .attr("x", d => (d['@default-x']*slider_value))
    .attr("y", d => d["@default-y"])
    .attr("width", d =>  (scale_of_measure/16)*parseInt(d["duration"])*slider_value);

    sheet.selectAll(".harmonic-relation")
    .attr("x", d => d['@default-x']*slider_value)
    .attr("width", d => ((scale_of_measure/16)*parseInt(d["duration"])*slider_value))
    .transition().duration(500)
    .style("opacity", "1");
}