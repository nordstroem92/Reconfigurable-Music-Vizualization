document.getElementById("transpose_degree").oninput = function(event) { 
    showTranspose(); 
}

document.getElementById("transpose").onclick = function(event) { 
    transpose(); 
}

var transpose_degree_before = 0;
var transpose_degree = 0;
function showTranspose(){
    transpose_degree = parseInt(document.getElementById("transpose_degree").value);
    sheet.selectAll(".harmonic-relation").transition().duration(500).style("opacity", "0");

    if (transpose_degree_before == 0 && transpose_degree == 1 || transpose_degree_before == 0 && transpose_degree == -1) { //CHECK FOR DELTA NOT IMPLEMENTED
        sheet.selectAll(".transpose-notes")
        .data(notes)
        .enter()
        .append("rect")
        .attr("class", "transpose-note")
        .attr("height", bar_height)
        .attr("width",  (d, i) => {
            if(!d['grace']) {
                return (beat_units)*parseInt(d["duration"]);
            } else {
                return 0;
            }
        }) 
        .attr("x", d => d['@default-x'])
        .attr("y", d => d["@default-y"])
        .style("fill", () => 'rgba(0, 0, 100, 0.3)')
        .style("stroke",  () => 'rgba(0, 0, 100, 0.3)')
        .style("stroke-width", "1")
        .transition().duration(300)
        .attr("y", (d, i) => d["@default-y"]-bar_height*transpose_degree);
    } else if (transpose_degree == 0){
        sheet.selectAll(".transpose-note").transition().duration(300)
        .attr("y", (d, i) => d["@default-y"]-bar_height*transpose_degree);
        d3.timeout( function(){
            sheet.selectAll(".transpose-note").remove();
        }, 300);
    } else {
        sheet.selectAll(".transpose-note")
        .transition().duration(300)
        .attr("y", (d, i) => d["@default-y"]-bar_height*transpose_degree);
    }
    transpose_degree_before = parseInt(document.getElementById("transpose_degree").value);
}

function transpose(){
    sheet.selectAll(".transpose-note").remove();
    sheet.selectAll(".note")
    .transition().duration(300)
    .attr("y", (d, i) => {
        notes[i]["@default-y"] = notes[i]["@default-y"]-bar_height*transpose_degree;
        return notes[i]["@default-y"];
    });

    sheet.selectAll(".harmonic-relation")
    .transition().duration(300)
    .attr("y", d => getIntervalY(d))
    .style("opacity", "1");
    
    var t = parseInt(document.getElementById("transpose_degree").value); //UPDATE KEY
    if(t > 0) {
        key_index = (key_index+t)%12;
    } else if (t < 0 &&  key_index+t < 0){
        key_index = key_index+t+12;
    } else if (t < 0){
        key_index = key_index+t;
    }
    key =  immutable_pitch_classes[key_index]; //UPDATE KEY PITCH CLASS
    drawTonality();

    document.getElementById("transpose_degree").value = 0;
    transpose_degree_before = 0;

    
}

document.getElementById("modulate").onchange = function(event) { 
    setupModes(this.value);
}

var previous_mode = {name: "ionian_mode", intervals: [2, 2, 1, 2, 2, 2, 1]};

function setupModes(mode){
    sheet.selectAll(".harmonic-relation").transition().duration(500).style("opacity", "0");

    var root_index = immutable_pitch_classes.indexOf(key);

    var previous_mode_notes = [];
    var new_mode_notes = []; 

    var next_note_index = root_index;
    for (i = 0; i < 7; i++) { //get notes of previous mode
        previous_mode_notes.push(immutable_pitch_classes[next_note_index%12]);
        next_note_index += previous_mode.intervals[i];
    }

    new_mode = modes.find(m => m.name === mode);

    next_note_index = root_index;
    for (i = 0; i < 7; i++) { //get notes of new mode
        new_mode_notes.push(immutable_pitch_classes[next_note_index%12]);
        next_note_index += new_mode.intervals[i];
    }

    var replacement_notes = notes;
  
    sheet.selectAll(".transpose-note").remove();

    sheet.selectAll(".transpose-notes")
    .data(replacement_notes)
    .enter()
    .append("rect")
    .attr("class", "transpose-note")
    .attr("height", bar_height)
    .attr("width",  (d, i) => {
        if(!d['grace']) {
            return (beat_units)*parseInt(d["duration"]);
        } else {
            return 0;
        }
    }) 
    .attr("x", d => d['@default-x'])
    .attr("y", d => d['@default-y'])
    .style("fill", () => 'rgba(0, 0, 100, 0.3)')
    .style("stroke",  () => 'rgba(0, 0, 100, 0.3)')
    .style("stroke-width", "1")
    .transition().duration(300)
    .attr("y", (d, i) => {
        for (j = 0; j < 7; j++) {
            if (d.pitch.step === previous_mode_notes[j]) {;
                d.pitch.step = new_mode_notes[j];
            }    
        }
        return get_note_y(d);
    });
    previous_mode = new_mode;
}



function modulate(){

}