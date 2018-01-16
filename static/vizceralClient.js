function run() {
    var viz = new Vizceral.default(document.getElementById('vizceral'));
    viz.setView();
    viz.animate();

    function updateData() {
        fetch('/data')
            .then(function(res) {
                res.json().then(function(data) {
                    viz.updateData(data)
                });
            })
            .then(function() {
                setTimeout(updateData, 5000)
            });
    }

    updateData();
}

function isNode(graph, serviceId) {
    return !!_(graph.nodes).findWhere({name: serviceId});
}

function getSpan(text, erro) {
    return "<span style='color: " + (erro ? "red" : "blue") + "'>" + text + "</span>";
}
