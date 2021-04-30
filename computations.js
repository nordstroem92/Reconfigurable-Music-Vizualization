
document.getElementById("toggleAggregateNotes").onclick = function() { //Sort by circle of fifths
    toggleAggregateNotes(); 
}

function toggleAggregateNotes() {
    var check = document.getElementById("toggleAggregateNotes");
    if(!check.checked) {
        makeLineChart();
    } else {
        adjustMeasureRange(500);
    }
}


function makeLineChart() {
    var slider_value = document.getElementById("measure-slider").value;
    sheet.selectAll(".harmonic-relation").remove();
    for (i = 0; i < pitch_classes.length; i++){
        pitch_classes[i].sum_x = 0;
    }
    sheet.selectAll(".note")
    .transition().duration(500)
    .attr("x", d => {  
        var d_relative_oct = parseInt(d.pitch.octave) - lowest_octave+1; //this is probably a stupid solution
        var pitch_name = pitch_classes.find(pc => pc.name == d.pitch.step && pc.oct_index == d_relative_oct);
        var pitch_index = pitch_classes.indexOf(pitch_name);
        x = pitch_classes[pitch_index].sum_x;
        pitch_classes[pitch_index].sum_x += (beat_units)*parseInt(d["duration"])*slider_value;
        return x;
    })
}