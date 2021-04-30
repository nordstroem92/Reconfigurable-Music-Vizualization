function updateView(e){
    sheet.selectAll("*").remove();
    sheet_info.selectAll("*").remove();
    d3.json("https://raw.githubusercontent.com/nordstroem92/musicviz/master/MusicJSON/New_Light.json").then(function(data) {
        pitch_classes = [];
        circle_of_fifths = [];
        c_major = [];
        sheet_height = 0;
        bar_height = 15;
        default_data;
        highest_octave = 0;
        lowest_octave = 10;
        octave_span;
        notes = [];
        chords;
        default_data = data;
        data_part = default_data.part[e];
        createNotesArray();
        getOctaveSpan();
        createPitchClassesArray();
        overwriteDefaultX();
        adjustSVGSize();
        drawNotes();
        drawStaffs();
        drawYLabels();
        drawMeasures();
        drawChordLabels();
        drawBeats(2);
        drawTonalRelations();
    });
}