document.getElementById("transpose_degree").oninput = function(event) { 
    showTranspose(); 
}

document.getElementById("transpose").onclick = function(event) { 
    transpose(); 
}

document.getElementById("modulate").onchange = function(event) { 
    showModes(this.value);
}

document.getElementById("modulate-btn").onclick = function(event) { 
    modulate();
}

document.getElementById("negate-btn").onclick = function(event) { 
    negateHarmony();
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
        .attr("rx", 3)
        .attr("width",  (d, i) => {
            if(!d['grace']) {
                return (beat_units)*parseInt(d["duration"])*slider_value;
            } else {
                return 0;
            }
        }) 
        .attr("x", d => d['@default-x']*slider_value)
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
        if (!d.pitch) {
            return 0;
        } else {
            var current_index = immutable_pitch_classes.indexOf(d.pitch.step);
            var new_index = current_index + transpose_degree;
            if (new_index > 11) {
                new_index = new_index%12;
                d.pitch.step = immutable_pitch_classes[new_index];
                d.pitch.octave = parseInt(d.pitch.octave)+1;
            } else if (new_index >= 0 && new_index < 12) {
                d.pitch.step = immutable_pitch_classes[new_index];
            } else if(new_index < 0){
                new_index += 12;
                d.pitch.step = immutable_pitch_classes[new_index];
                d.pitch.octave = d.pitch.octave-1;
            }
            get_note_y(d);
            return d["@default-y"];
        }
    });

    sheet.selectAll(".harmonic-relation")
    .transition().duration(300)
    .attr("y", (d,i) => getIntervalY(d,i))
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

var previous_substitute_mode = {name: "ionian_mode", intervals: [2, 2, 1, 2, 2, 2, 1]};

function getModeNotes(mode_array, mode_pattern){
    var root_index = immutable_pitch_classes.indexOf(key);
    var next_note_index = root_index;
    for (i = 0; i < 7; i++) { //get notes of previous mode
        mode_array.push(immutable_pitch_classes[next_note_index%12]);
        next_note_index += mode_pattern.intervals[i];
    }
}

function showModes(mode){
    console.log(key);
    var previous_substitute_mode_notes = [];
    var new_substitute_mode = []; 

    getModeNotes(previous_substitute_mode_notes, previous_substitute_mode);

    new_mode = modes.find(m => m.name === mode);

    getModeNotes(new_substitute_mode, new_mode);

    var replacement_notes = notes;
  
    sheet.selectAll(".harmonic-relation").transition().duration(500).style("opacity", "0");
    sheet.selectAll(".transpose-note").remove();
    sheet.selectAll(".transpose-notes")
    .data(replacement_notes)
    .enter()
    .append("rect")
    .attr("class", "transpose-note")
    .attr("height", bar_height)
    .attr("rx", 3)
    .attr("width",  (d, i) => {
        if(!d['grace']) {
            return (beat_units)*parseInt(d["duration"])*slider_value;
        } else {
            return 0;
        }
    }) 
    .attr("x", d => d['@default-x']*slider_value)
    .attr("y", d => d['@default-y'])
    .style("fill", () => 'rgba(0, 0, 100, 0.3)')
    .style("stroke",  () => 'rgba(0, 0, 100, 0.3)')
    .style("stroke-width", "1")
    .transition().duration(300)
    .attr("y", (d, i) => {
        for (j = 0; j < 7; j++) {
            if (d.pitch.step === previous_substitute_mode_notes[j]) {;
                d.pitch.step = new_substitute_mode[j];
            }    
        }
        return get_note_y(d);
    });
    previous_substitute_mode = new_mode;
}

function getModeNotes(mode_array, mode_pattern){
    var root_index = immutable_pitch_classes.indexOf(key);
    var next_note_index = root_index;
    for (i = 0; i < 7; i++) { //get notes of previous mode
        mode_array.push(immutable_pitch_classes[next_note_index%12]);
        next_note_index += mode_pattern.intervals[i];
    }
}

var previous_mode = {name: "ionian_mode", intervals: [2, 2, 1, 2, 2, 2, 1]};

function modulate(){
    sheet.selectAll(".transpose-note").remove();
    var mode = document.getElementById("modulate").value;

    var previous_mode_notes = [];
    var new_mode_notes = []; 

    getModeNotes(previous_mode_notes, previous_mode);

    new_mode = modes.find(m => m.name === mode);

    getModeNotes(new_mode_notes, new_mode);

    sheet.selectAll(".note")
    .transition().duration(300)
    .attr("y", (d, i) => {
        if (!d.pitch) {
            return 0;
        } else {
            for (j = 0; j < 7; j++) {
                if (d.pitch.step === previous_mode_notes[j]) {;
                    d.pitch.step = new_mode_notes[j];
                    get_note_y(d);
                } 
            } 
            return d["@default-y"];
        }
    });

    sheet.selectAll(".harmonic-relation").remove();
    drawTonalRelations();

    previous_mode = new_mode;
    drawTonality();
}

function negateHarmony(){
    var circle_of_fifths_array =["C", "G", "D", "A", "E", "B", "G♭", "D♭", "A♭", "E♭", "B♭", "F"];
    var cof_key_index = circle_of_fifths_array.indexOf(key)
    var clockwise_index = (cof_key_index + 1)%12;
    var counter_clockwise_index = cof_key_index;

    var right_half = [];
    var left_half = [];

    for(i = 0; i < 6 ; i++){
        right_half.push(circle_of_fifths_array[clockwise_index]);
        clockwise_index = (clockwise_index+1)%12;
    }
    for(i = 0; i < 6 ; i++){
        left_half.push(circle_of_fifths_array[counter_clockwise_index]);
        counter_clockwise_index = (counter_clockwise_index > 0) ? counter_clockwise_index-1:(counter_clockwise_index-1)+12;
    }

    sheet.selectAll(".note")
    .transition().duration(300)
    .attr("y", (d, i) => {
        for (j = 0; j < 6; j++) {
            if (d.pitch.step === right_half[j]) {
                d.pitch.step = left_half[j];
            } else if (d.pitch.step === left_half[j])
                d.pitch.step = right_half[j];
            }
        return get_note_y(d);
    });

    sheet.selectAll(".harmonic-relation").remove();
    notes = notes.sort((a,b) => ascendingSort(a, b))
    drawTonalRelations();
}

function ascendingSort(a, b){
    if(a["@default-x"] < b["@default-x"]) {
        return -1; 
    } else if(a["@default-x"] == b["@default-x"]) {
        if(a["@default-y"] > b["@default-y"]) {
            return -1; 
        } else {
            return 1;
        }
    } else if(a["@default-x"] > b["@default-x"]) {
        return 1;
    }
}

/*function showNegativeHarmony(){
    var circle_of_fifths_array =["C", "G", "D", "A", "E", "B", "G♭", "D♭", "A♭", "E♭", "B♭", "F"];
    var cof_key_index = circle_of_fifths_array.indexOf(key)
    var clockwise_index = (cof_key_index + 1)%12;
    var counter_clockwise_index = cof_key_index;

    var right_half = [];
    var left_half = [];

    for(i = 0; i < 6 ; i++){
        right_half.push(circle_of_fifths_array[clockwise_index]);
        clockwise_index = (clockwise_index+1)%12;
    }
    for(i = 0; i < 6 ; i++){
        left_half.push(circle_of_fifths_array[counter_clockwise_index]);
        counter_clockwise_index = (counter_clockwise_index > 0) ? counter_clockwise_index-1:(counter_clockwise_index-1)+12;
    }

    var replacement_notes = notes;
    sheet.selectAll(".harmonic-relation").transition().duration(500).style("opacity", "0");
    sheet.selectAll(".transpose-note").remove();
    sheet.selectAll(".transpose-notes")
    .data(replacement_notes)
    .enter()
    .append("rect")
    .attr("class", "transpose-note")
    .attr("height", bar_height)
    .attr("rx", 3)
    .attr("width",  (d, i) => {
        if(!d['grace']) {
            return (beat_units)*parseInt(d["duration"])*slider_value;
        } else {
            return 0;
        }
    }) 
    .attr("x", d => d['@default-x']*slider_value)
    .attr("y", d => d['@default-y'])
    .style("fill", () => 'rgba(0, 0, 100, 0.3)')
    .style("stroke",  () => 'rgba(0, 0, 100, 0.3)')
    .style("stroke-width", "1")
    .transition().duration(300)
    .attr("y", (d, i) => {
        for (j = 0; j < 6; j++) {
            if (d.pitch.step === right_half[j]) {
                d.pitch.step = left_half[j];
            } else if (d.pitch.step === left_half[j]){
                d.pitch.step = right_half[j];
            }
        return get_note_y(d);
        }
    });
}*/
