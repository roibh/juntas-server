if (!window["chrome"])
    window["chrome"] = {
        "runtime": {}
    }

window["chrome"].runtime.getManifest = function () {
    var manifest = {}
    manifest.version = "2.0";
    return manifest;
}