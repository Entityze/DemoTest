// display comparison details
var donut_data;
var donut_value;
var doc_info_url;
var doc_info_source;
var doc_info_date;
var document;
var prefixArray;

var entityze_host = "https://demo.entityze.com"
//var entityze_host = "http://127.0.0.1"

var url = window.location.pathname;
var filename = url.substring(url.lastIndexOf('/') + 1);
console.log(filename)

var entityze_markup_url = entityze_host + "/markup/"
var entityze_comp_url = entityze_host + "/comp/"
var entityze_meta_url = entityze_host + "/meta/"

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const fileprefix_qp = getParameterByName("fileprefix");
const collection = getParameterByName("collection");
var engine = getParameterByName("engine");
var demo = getParameterByName("demo");


$(document).ready(async function () {
    if (demo === "comp") {
        $("#comparison_header_markup").hide()
    } else {
        $("#comparison_header_comp").hide()
    }
    if (engine === "msft") {
        $("#comparison_result_tag").text("MSFT RESULTS")
    } else if (engine === "google") {
        $("#comparison_result_tag").text("GOOGLE RESULTS")
    }
    if (collection) {
        entityze_markup_url = entityze_host + "/markup/" + collection + "/"
    }
    const checkElement = async selector => {
        while (document.querySelector(selector) === null) {
            await new Promise(resolve => requestAnimationFrame(resolve))
        }
        return document.querySelector(selector);
    };

    async function update_filelist() {
        const response = await fetch('/json/markup_' + engine + '.json');
        const list = await response.json()
        return list;
    }

    prefixArray = await update_filelist();
    if (window.location.pathname === "/demo.html") {
        t = [];
        for (var i = 0; i < prefixArray.length; i++) {
            if (prefixArray[i].includes("col_public/")) {
                t.push(prefixArray[i]);
            }
        }
        prefixArray = t;

    }

    $("#search-doc-tb").autocomplete({
        source: prefixArray,
        select: search_doc_bt_item_change
    })

    function search_doc_bt_item_change(event, ui) {
        render_doc_by_prefix(ui.item.label);
    }

    var prefixArrayLength = prefixArray.length;

    var filePrefix = prefixArray[Math.floor(Math.random() * prefixArray.length)];
    if (fileprefix_qp) {
        filePrefix = fileprefix_qp
    }
    render_doc_by_prefix(filePrefix)
    // Initialize Bootstrap & Popper tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    console.log(tooltipTriggerList)
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    console.log('initialized tooltips via JS')

});

function display_metadata(json_content) {
    //donut_data = json_content.stats_entityze.current_score_percentage;
    //donut_value = json_content.stats_entityze.current_score_plus_percentage;
    //display_donut();
    doc_info_url = json_content.info.url;
    doc_info_source = json_content.info.source;
    doc_info_date = json_content.info.creation_date;
};

function display_donut() {
    // Data
    var value = donut_value
    var text = Math.round(value * 100) + '%'

    //var data = [0.0, 0.12142857142857143, 0.05, 0.0, 0.24285714285714285, 0.19285714285714287, 0.08571428571428572, 0.2642857142857143, 0]
    var data = donut_data

    // Settings
    var width = 360
    var height = 80
    var anglesRange = 0.5 * Math.PI
    var radis = Math.min(width, 2 * height) / 2
    var thickness = 32
    // Colors

    // stat_aggregation_values = ("-","--","---","=","==","===","+","++","+++", "?")

    // old var colors = ["#DD8B66", "#DD8B66", "#C73F00", "#949494", "#949494", "#545454", "#66C094", "#00964D", "#00964D" ]

    var colors = ["#DD8B66", "#DD8B66", "#C73F00", "#949494", "#949494", "#949494", "#66C094", "#66C094", "#00964D"]

    var pies = d3.layout.pie()
        .value(d => d)
        .sort(null)
        .startAngle(anglesRange * -1)
        .endAngle(anglesRange)

    var arc = d3.svg.arc()
        .outerRadius(radis)
        .innerRadius(radis - thickness)

    var translation = (x, y) => `translate(${x}, ${y})`

    // Feel free to change or delete any of the code you see in this editor!
    var svg = d3.select("#comparison_donut").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "half-donut")
        .append("g")
        .attr("transform", translation(width / 2, height))

    svg.selectAll("path")
        .data(pies(data))
        .enter()
        .append("path")
        .attr("fill", (d, i) => colors[i])
        .attr("d", arc)

    svg.append("text")
        .text(d => text)
        .attr("dy", "-0.5rem")
        .attr("class", "label")
        .attr("fill", "#00964D")
        .attr("text-anchor", "middle")

    score_summary.append('Entityze delivers a ' + (100 * donut_value).toFixed(0).toString() + '% improvement over Microsoft for this document.')
    //doc_information.append('Source: ' + doc_info_source +' ('+doc_info_date.toString() + ')')

};

async function render_doc_by_prefix(prefix) {

    records = prefixArray.filter(element => element === prefix);
    if (records.length === 0) {
        alert("Document not found")
    } else {
        // console.log(records[0])

        var filename_html = entityze_markup_url.concat(prefix);
        var filename_meta = entityze_meta_url.concat(prefix);
        var filename_comp = entityze_comp_url.concat(prefix);

        async function load_file(name) {
            const response = await fetch(name);
            const txt = await response.text();
            return txt;
        }

        async function load_json_file(name) {
            const response = await fetch(name);
            const js = await response.json();
            return js;
        }

        if (demo === "markup") {
            var source = await load_file(filename_html.concat("_" + engine + ".html"));
            document.getElementById('source').innerHTML = source
        } else if (demo === "comp") {
            var comparison = await load_file(filename_comp.concat("_compare_" + engine + "_entityze.html"));
            var source0 = await load_file(filename_html.concat("_entityze.html"));
            var source1 = await load_file(filename_html.concat("_" + engine + ".html"));

            document.getElementById('comparison').innerHTML = comparison
            document.getElementById('source0').innerHTML = source0
            document.getElementById('source1').innerHTML = source1
        }


        const json_content = await load_json_file(filename_meta.concat("_meta.json"));
        display_metadata(json_content);
        document.getElementById('doc_information').innerHTML = '<br>' + 'Title: ' + prefix
            + '<br>' + 'Source: ' + doc_info_source
            + '<br>' + 'Date: ' + doc_info_date + '<br>';


        $('span.entity').click(function (event) {
            $(this).tooltip('show');
        });
    }
}