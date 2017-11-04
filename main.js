var imageToggles = [];

function imageToggle(e){
    var element = e.target;
    var index = imageToggles.indexOf(element.parentElement);
    if (index >= 0){
        var t = imageToggles[index];
        t.on = !t.on ;
        t.getElementsByTagName("img")[0].style.display = t.on ? "block" : "none";
    }
}

function start(){
    var toggles = document.getElementsByClassName("image-toggle");
    for (var i = 0; i < toggles.length; i++){
        var t = toggles[i];
        imageToggles[i] = t;
        var a = toggles[i].getElementsByTagName("a")[0];
        a.addEventListener("click",imageToggle);
        t.on = false;
    }
}
window.addEventListener("load",start);